// Popup script for Image Pocket Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
  await loadSavedImages();
  setupEventListeners();
});

async function loadSavedImages() {
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSavedImages' }, resolve);
    });
    
    const images = response.images || [];
    displayImages(images);
    updateStats(images.length);
  } catch (error) {
    console.error('Error loading images:', error);
    showError('Failed to load images');
  }
}

function displayImages(images) {
  const content = document.getElementById('content');
  const loading = document.getElementById('loading');
  
  loading.style.display = 'none';
  
  if (images.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="icon">🖼️</div>
        <h3>No images saved yet</h3>
        <p>Right-click on any image on the web and select "Save to Image Pocket" to get started!</p>
      </div>
    `;
    return;
  }
  
  const imageGrid = document.createElement('div');
  imageGrid.className = 'image-grid';
  
  images.forEach(image => {
    const imageItem = createImageItem(image);
    imageGrid.appendChild(imageItem);
  });
  
  content.innerHTML = '';
  content.appendChild(imageGrid);
}

function createImageItem(image) {
  const item = document.createElement('div');
  item.className = 'image-item';
  item.innerHTML = `
    <img src="${image.url}" alt="Saved image" loading="lazy">
    <button class="delete-btn" onclick="deleteImage('${image.id}')" title="Delete image">×</button>
    <div class="image-info">
      <h4 class="image-title">${image.title}</h4>
      <p class="image-date">${formatDate(image.timestamp)}</p>
    </div>
  `;
  
  // Add click handler to open image in new tab
  item.addEventListener('click', (e) => {
    if (!e.target.classList.contains('delete-btn')) {
      chrome.tabs.create({ url: image.url });
    }
  });
  
  return item;
}

async function deleteImage(imageId) {
  if (!confirm('Are you sure you want to delete this image?')) {
    return;
  }
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ 
        action: 'deleteImage', 
        imageId: imageId 
      }, resolve);
    });
    
    if (response.success) {
      await loadSavedImages(); // Refresh the list
    } else {
      showError('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    showError('Failed to delete image');
  }
}

function updateStats(count) {
  const stats = document.getElementById('stats');
  const imageCount = document.getElementById('imageCount');
  
  if (count > 0) {
    stats.style.display = 'block';
    imageCount.textContent = `${count} image${count === 1 ? '' : 's'} saved`;
  } else {
    stats.style.display = 'none';
  }
}

function setupEventListeners() {
  const settingsBtn = document.getElementById('settingsBtn');
  settingsBtn.addEventListener('click', openSettings);
}

function openSettings() {
  // Create a simple settings modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 300px;
      width: 90%;
    ">
      <h3 style="margin: 0 0 16px 0; color: #334155;">Settings</h3>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #64748b;">
          Vercel Blob API URL:
        </label>
        <input type="text" id="apiUrl" placeholder="https://your-project.vercel.app/api/upload-image" 
               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #64748b;">
          Vercel Blob Token:
        </label>
        <input type="password" id="apiToken" placeholder="Your Vercel Blob token" 
               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="cancelBtn" style="
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          color: #64748b;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Cancel</button>
        <button id="saveBtn" style="
          padding: 8px 16px;
          border: none;
          background: #667eea;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Save</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load current settings
  chrome.storage.sync.get(['apiUrl', 'apiToken'], (result) => {
    document.getElementById('apiUrl').value = result.apiUrl || '';
    document.getElementById('apiToken').value = result.apiToken || '';
  });
  
  // Event listeners
  document.getElementById('cancelBtn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.getElementById('saveBtn').addEventListener('click', () => {
    const apiUrl = document.getElementById('apiUrl').value;
    const apiToken = document.getElementById('apiToken').value;
    
    chrome.storage.sync.set({ apiUrl, apiToken }, () => {
      document.body.removeChild(modal);
      showSuccess('Settings saved successfully!');
    });
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diff < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function showError(message) {
  showNotification(message, 'error');
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    padding: 12px;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    z-index: 1001;
    text-align: center;
    ${type === 'error' ? 'background: #ef4444;' : 'background: #10b981;'}
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Make deleteImage available globally
window.deleteImage = deleteImage;
