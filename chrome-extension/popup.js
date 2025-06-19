// Popup JavaScript for Image Pocket Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  await loadSettings();
  
  // Load saved images
  await loadSavedImages();
  
  // Set up event listeners
  setupEventListeners();
});

// Load settings from Chrome storage
async function loadSettings() {
  const result = await chrome.storage.sync.get(['vercelAppUrl']);
  const vercelUrlInput = document.getElementById('vercelUrl');
  vercelUrlInput.value = result.vercelAppUrl || 'http://localhost:3000';
  
  // Save settings when input changes
  vercelUrlInput.addEventListener('change', async () => {
    await chrome.storage.sync.set({ vercelAppUrl: vercelUrlInput.value });
    showStatus('Settings saved!', 'success');
  });
}

// Load saved images from local storage
async function loadSavedImages() {
  const loading = document.getElementById('loading');
  const noImages = document.getElementById('noImages');
  const imageGrid = document.getElementById('imageGrid');
  const imageCount = document.getElementById('imageCount');
  
  loading.classList.remove('hidden');
  noImages.classList.add('hidden');
  
  try {
    const result = await chrome.storage.local.get(['savedImages']);
    const images = result.savedImages || [];
    
    loading.classList.add('hidden');
    
    if (images.length === 0) {
      noImages.classList.remove('hidden');
      imageCount.textContent = '0';
      return;
    }
    
    // Update count
    imageCount.textContent = images.length.toString();
    
    // Clear existing images
    imageGrid.innerHTML = '';
    
    // Display images (show only first 20 for performance)
    const imagesToShow = images.slice(0, 20);
    imagesToShow.forEach(image => {
      const imageElement = createImageElement(image);
      imageGrid.appendChild(imageElement);
    });
    
  } catch (error) {
    console.error('Error loading images:', error);
    loading.classList.add('hidden');
    showStatus('Error loading images', 'error');
  }
}

// Create image element for the grid
function createImageElement(image) {
  const div = document.createElement('div');
  div.className = 'image-item';
  div.title = `${image.title}\n${image.description}`;
  
  div.innerHTML = `
    <img src="${image.url}" alt="${image.title}" loading="lazy">
    <div class="image-info">
      <div class="image-title">${image.title}</div>
      <div class="image-date">${formatDate(image.savedAt)}</div>
    </div>
  `;
  
  // Add click handler to open image
  div.addEventListener('click', () => {
    chrome.tabs.create({ url: image.url });
  });
  
  return div;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Set up event listeners
function setupEventListeners() {
  // Save all images button
  document.getElementById('saveAllImages').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'saveAllImages',
      pageUrl: tab.url,
      pageTitle: tab.title
    });
    
    showStatus('Saving images from page...', 'success');
    
    // Refresh images after a delay
    setTimeout(() => {
      loadSavedImages();
    }, 3000);
  });
  
  // Open web app button
  document.getElementById('openWebApp').addEventListener('click', async () => {
    const result = await chrome.storage.sync.get(['vercelAppUrl']);
    const vercelAppUrl = result.vercelAppUrl || 'http://localhost:3000';
    chrome.tabs.create({ url: vercelAppUrl });
  });
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'imagesSaved') {
      loadSavedImages();
      showStatus('Images saved successfully!', 'success');
    } else if (request.action === 'saveFailed') {
      showStatus('Failed to save images', 'error');
    }
  });
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove('hidden');
  
  // Hide after 3 seconds
  setTimeout(() => {
    status.classList.add('hidden');
  }, 3000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save all images
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    document.getElementById('saveAllImages').click();
  }
  
  // Ctrl/Cmd + O to open web app
  if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
    e.preventDefault();
    document.getElementById('openWebApp').click();
  }
});

// Refresh images when popup is focused
window.addEventListener('focus', () => {
  loadSavedImages();
});

// Auto-refresh images every 30 seconds
setInterval(() => {
  loadSavedImages();
}, 30000);