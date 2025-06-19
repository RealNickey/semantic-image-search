// Background service worker for Image Pocket Chrome Extension

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveImageToPocket",
    title: "Save image to Pocket",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "savePageImages",
    title: "Save all images from this page",
    contexts: ["page"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveImageToPocket") {
    // Send message to content script to save specific image
    chrome.tabs.sendMessage(tab.id, {
      action: "saveImage",
      imageUrl: info.srcUrl,
      pageUrl: info.pageUrl,
      pageTitle: tab.title
    });
  } else if (info.menuItemId === "savePageImages") {
    // Send message to content script to save all images
    chrome.tabs.sendMessage(tab.id, {
      action: "saveAllImages",
      pageUrl: info.pageUrl,
      pageTitle: tab.title
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "uploadImage") {
    uploadImageToVercel(request.imageData, request.metadata)
      .then(result => {
        sendResponse({ success: true, result });
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon48.png',
          title: 'Image Pocket',
          message: 'Image saved successfully!'
        });
      })
      .catch(error => {
        console.error('Upload failed:', error);
        sendResponse({ success: false, error: error.message });
        // Show error notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon48.png',
          title: 'Image Pocket',
          message: 'Failed to save image. Please try again.'
        });
      });
    return true; // Will respond asynchronously
  }
});

// Function to upload image to Vercel
async function uploadImageToVercel(imageData, metadata) {
  try {
    // Convert data URL to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    // Create form data
    const formData = new FormData();
    
    // Create a file from the blob
    const file = new File([blob], `image-${Date.now()}.${getFileExtension(blob.type)}`, {
      type: blob.type
    });
    
    formData.append('file', file);
    formData.append('source', 'chrome-extension');
    formData.append('originalUrl', metadata.originalUrl || '');
    formData.append('pageUrl', metadata.pageUrl || '');
    formData.append('pageTitle', metadata.pageTitle || '');
    
    // Get the Vercel app URL from storage or use default
    const result = await chrome.storage.sync.get(['vercelAppUrl']);
    const vercelAppUrl = result.vercelAppUrl || 'http://localhost:3000';
    
    // Upload to Vercel
    const uploadResponse = await fetch(`${vercelAppUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    
    // Store the saved image info locally
    const savedImages = await chrome.storage.local.get(['savedImages']);
    const images = savedImages.savedImages || [];
    images.unshift({
      id: Date.now().toString(),
      url: uploadResult.image.url,
      title: uploadResult.image.title,
      description: uploadResult.image.description,
      originalUrl: metadata.originalUrl,
      pageUrl: metadata.pageUrl,
      pageTitle: metadata.pageTitle,
      savedAt: new Date().toISOString()
    });
    
    // Keep only last 100 images in local storage
    if (images.length > 100) {
      images.splice(100);
    }
    
    await chrome.storage.local.set({ savedImages: images });
    
    return uploadResult;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Helper function to get file extension from MIME type
function getFileExtension(mimeType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
  };
  return extensions[mimeType] || 'jpg';
}

// Add notification permission
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
});