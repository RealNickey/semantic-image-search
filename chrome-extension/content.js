// Content script for Image Pocket Chrome Extension

// Add event listeners for image interactions
document.addEventListener('DOMContentLoaded', initializeImagePocket);

function initializeImagePocket() {
  // Add hover effects and save buttons to images
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Skip if already processed
    if (img.dataset.imagePocketProcessed) return;
    
    img.dataset.imagePocketProcessed = 'true';
    
    // Create save button
    const saveButton = createSaveButton();
    
    // Position save button
    const container = createImageContainer(img, saveButton);
    
    // Add event listeners
    img.addEventListener('mouseenter', () => {
      if (isValidImage(img)) {
        showSaveButton(saveButton);
      }
    });
    
    container.addEventListener('mouseleave', () => {
      hideSaveButton(saveButton);
    });
    
    saveButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      saveImageToPocket(img.src);
    });
  });
}

function createSaveButton() {
  const button = document.createElement('div');
  button.className = 'image-pocket-save-btn';
  button.innerHTML = '📌';
  button.title = 'Save to Image Pocket';
  button.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    z-index: 10000;
    transition: all 0.2s ease;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(0, 0, 0, 0.9)';
    button.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = 'rgba(0, 0, 0, 0.8)';
    button.style.transform = 'scale(1)';
  });
  
  return button;
}

function createImageContainer(img, saveButton) {
  // Skip if image is already in a container
  if (img.parentElement?.classList.contains('image-pocket-container')) {
    return img.parentElement;
  }
  
  const container = document.createElement('div');
  container.className = 'image-pocket-container';
  container.style.cssText = `
    position: relative;
    display: inline-block;
  `;
  
  // Wrap the image
  img.parentNode.insertBefore(container, img);
  container.appendChild(img);
  container.appendChild(saveButton);
  
  return container;
}

function isValidImage(img) {
  // Check if image is large enough and loaded
  return img.complete && 
         img.naturalWidth > 100 && 
         img.naturalHeight > 100 && 
         img.src.startsWith('http');
}

function showSaveButton(button) {
  button.style.display = 'flex';
}

function hideSaveButton(button) {
  button.style.display = 'none';
}

async function saveImageToPocket(imageUrl) {
  try {
    // Show loading state
    showNotification('Saving image...', 'info');
    
    // Send message to background script
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'saveImage',
        imageUrl: imageUrl,
        pageUrl: window.location.href
      }, resolve);
    });
    
    if (response.success) {
      showNotification('Image saved to pocket!', 'success');
    } else {
      showNotification('Failed to save image', 'error');
    }
  } catch (error) {
    console.error('Error saving image:', error);
    showNotification('Failed to save image', 'error');
  }
}

function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.image-pocket-notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'image-pocket-notification';
  notification.textContent = message;
  
  const colors = {
    info: '#3498db',
    success: '#2ecc71',
    error: '#e74c3c'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation keyframes
  if (!document.querySelector('#image-pocket-styles')) {
    const style = document.createElement('style');
    style.id = 'image-pocket-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

// Re-initialize when new content is loaded (for SPAs)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
        images.forEach(img => {
          if (!img.dataset.imagePocketProcessed) {
            initializeImagePocket();
          }
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeImagePocket);
} else {
  initializeImagePocket();
}
