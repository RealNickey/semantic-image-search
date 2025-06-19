// Background script for Image Pocket Chrome Extension

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveImage",
    title: "Save to Image Pocket",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveImage" && info.srcUrl) {
    try {
      await saveImageToVercelBlob(info.srcUrl, info.pageUrl || tab.url);
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Image Pocket',
        message: 'Image saved successfully!'
      });
    } catch (error) {
      console.error('Failed to save image:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Image Pocket',
        message: 'Failed to save image. Please try again.'
      });
    }
  }
});

// Function to save image to Vercel Blob
async function saveImageToVercelBlob(imageUrl, pageUrl) {
  try {
    // Get settings from storage
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(['apiUrl', 'apiToken'], resolve);
    });
    
    if (!settings.apiUrl || !settings.apiToken) {
      throw new Error('Please configure API URL and token in extension settings');
    }
    
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const imageBlob = await imageResponse.blob();
    
    // Create FormData for upload
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('sourceUrl', pageUrl);
    formData.append('imageUrl', imageUrl);
    formData.append('timestamp', Date.now().toString());
    
    // Upload to Vercel Blob via API route
    const uploadResponse = await fetch(settings.apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${settings.apiToken}`
      }
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload image');
    }
    
    const result = await uploadResponse.json();
    
    // Store metadata in Chrome storage
    const imageData = {
      id: generateId(),
      url: result.url,
      originalUrl: imageUrl,
      sourceUrl: pageUrl,
      timestamp: Date.now(),
      title: extractTitleFromUrl(pageUrl)
    };
    
    await saveImageMetadata(imageData);
    
    return result;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

// Function to save image metadata to Chrome storage
async function saveImageMetadata(imageData) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['savedImages'], (result) => {
      const savedImages = result.savedImages || [];
      savedImages.unshift(imageData);
      
      chrome.storage.local.set({ savedImages }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function extractTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'Unknown Source';
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSavedImages') {
    chrome.storage.local.get(['savedImages'], (result) => {
      sendResponse({ images: result.savedImages || [] });
    });
    return true; // Indicates we'll send a response asynchronously
  }
  
  if (request.action === 'deleteImage') {
    chrome.storage.local.get(['savedImages'], (result) => {
      const savedImages = result.savedImages || [];
      const filteredImages = savedImages.filter(img => img.id !== request.imageId);
      
      chrome.storage.local.set({ savedImages: filteredImages }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.action === 'saveImage') {
    saveImageToVercelBlob(request.imageUrl, request.pageUrl)
      .then((result) => {
        sendResponse({ success: true, result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});
