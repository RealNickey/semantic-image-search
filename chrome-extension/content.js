// Content script for Image Pocket Chrome Extension

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveImage") {
    saveImageToPocket(request.imageUrl, {
      originalUrl: request.imageUrl,
      pageUrl: request.pageUrl,
      pageTitle: request.pageTitle
    });
  } else if (request.action === "saveAllImages") {
    saveAllImagesFromPage({
      pageUrl: request.pageUrl,
      pageTitle: request.pageTitle
    });
  }
});

// Function to save a specific image
async function saveImageToPocket(imageUrl, metadata) {
  try {
    // Show loading indicator
    showNotification('Saving image...', 'info');
    
    // Convert image URL to data URL
    const imageData = await getImageAsDataURL(imageUrl);
    
    // Send to background script for upload
    chrome.runtime.sendMessage({
      action: 'uploadImage',
      imageData: imageData,
      metadata: metadata
    }, (response) => {
      if (response && response.success) {
        showNotification('Image saved successfully!', 'success');
      } else {
        showNotification('Failed to save image', 'error');
      }
    });
  } catch (error) {
    console.error('Error saving image:', error);
    showNotification('Failed to save image', 'error');
  }
}

// Function to save all images from the current page
async function saveAllImagesFromPage(metadata) {
  try {
    // Find all images on the page
    const images = document.querySelectorAll('img');
    const validImages = Array.from(images).filter(img => {
      // Filter out small images (likely icons, logos, etc.)
      return img.naturalWidth > 200 && img.naturalHeight > 200 && 
             img.src && !img.src.startsWith('data:') &&
             !img.src.includes('icon') && !img.src.includes('logo');
    });
    
    if (validImages.length === 0) {
      showNotification('No suitable images found on this page', 'info');
      return;
    }
    
    showNotification(`Saving ${validImages.length} images...`, 'info');
    
    // Save images with a delay to avoid overwhelming the server
    for (let i = 0; i < validImages.length; i++) {
      const img = validImages[i];
      try {
        await saveImageToPocket(img.src, {
          ...metadata,
          originalUrl: img.src
        });
        
        // Add delay between uploads
        if (i < validImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error saving image ${i + 1}:`, error);
      }
    }
    
    showNotification(`Saved ${validImages.length} images!`, 'success');
  } catch (error) {
    console.error('Error saving images:', error);
    showNotification('Failed to save images', 'error');
  }
}

// Function to convert image URL to data URL
async function getImageAsDataURL(imageUrl) {
  return new Promise((resolve, reject) => {
    // Handle relative URLs
    const absoluteUrl = new URL(imageUrl, window.location.href).href;
    
    // Create a canvas to convert the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      } catch (error) {
        // If canvas conversion fails, try fetching as blob
        fetchImageAsDataURL(absoluteUrl).then(resolve).catch(reject);
      }
    };
    
    img.onerror = function() {
      // Fallback to fetch method
      fetchImageAsDataURL(absoluteUrl).then(resolve).catch(reject);
    };
    
    img.src = absoluteUrl;
  });
}

// Fallback function to fetch image as data URL
async function fetchImageAsDataURL(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

// Function to show notifications on the page
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.getElementById('image-pocket-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'image-pocket-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    max-width: 300px;
  `;
  
  // Set background color based on type
  const colors = {
    info: '#2196F3',
    success: '#4CAF50',
    error: '#f44336'
  };
  notification.style.backgroundColor = colors[type] || colors.info;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Add hover effect for images to show save button
let hoverTimeout;
document.addEventListener('mouseover', (e) => {
  if (e.target.tagName === 'IMG' && e.target.naturalWidth > 200 && e.target.naturalHeight > 200) {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      showImageSaveButton(e.target);
    }, 500);
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.tagName === 'IMG') {
    clearTimeout(hoverTimeout);
    hideImageSaveButton();
  }
});

function showImageSaveButton(img) {
  // Remove existing button
  hideImageSaveButton();
  
  const button = document.createElement('button');
  button.id = 'image-pocket-save-btn';
  button.innerHTML = '💾 Save';
  button.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: background 0.2s;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.background = '#1976D2';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = '#2196F3';
  });
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveImageToPocket(img.src, {
      originalUrl: img.src,
      pageUrl: window.location.href,
      pageTitle: document.title
    });
    hideImageSaveButton();
  });
  
  // Position button relative to image
  const rect = img.getBoundingClientRect();
  button.style.left = (rect.right - 70 + window.scrollX) + 'px';
  button.style.top = (rect.top + 10 + window.scrollY) + 'px';
  
  document.body.appendChild(button);
}

function hideImageSaveButton() {
  const button = document.getElementById('image-pocket-save-btn');
  if (button) {
    button.remove();
  }
}