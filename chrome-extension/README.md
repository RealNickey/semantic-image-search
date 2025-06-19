# Image Pocket Chrome Extension

A Chrome extension that functions like Pocket but for images. Save images from any website directly to your semantic image search collection powered by Vercel Blob storage.

## Features

- **Right-click to save**: Right-click on any image and select "Save image to Pocket"
- **Bulk save**: Save all suitable images from a webpage with one click
- **Hover to save**: Hover over images to see a quick save button
- **Visual feedback**: Get instant notifications when images are saved
- **Recent images**: View your recently saved images in the extension popup
- **Semantic search**: All saved images are processed with AI for better searchability

## Installation

1. **Build the Next.js app** (if not already done):
   ```bash
   npm run build
   # or
   pnpm build
   ```

2. **Set up environment variables**:
   Make sure your `.env.local` file contains:
   ```
   AZURE_API_KEY=your_azure_api_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

3. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `chrome-extension` folder from this project

4. **Configure the extension**:
   - Click the extension icon in Chrome
   - Set your Vercel app URL (e.g., `http://localhost:3000` or `https://your-app.vercel.app`)

## How to Use

### Method 1: Right-click Context Menu
1. Right-click on any image on a webpage
2. Select "Save image to Pocket" from the context menu
3. The image will be uploaded and processed automatically

### Method 2: Hover Save Button
1. Hover over any large image on a webpage
2. Click the "💾 Save" button that appears
3. The image will be saved instantly

### Method 3: Bulk Save
1. Click the extension icon
2. Click "📸 Save All Images from Page"
3. All suitable images from the current page will be saved

### Method 4: Extension Popup
1. Click the extension icon to open the popup
2. View your recently saved images
3. Click on any image to open it in a new tab
4. Use the "🌐 Open Web App" button to access the full search interface

## Technical Details

### API Integration
The extension uses the `/api/extension/route.ts` endpoint which:
- Accepts image uploads from the Chrome extension
- Processes images with Azure OpenAI GPT-4o for metadata generation
- Generates embeddings for semantic search
- Stores images in Vercel Blob storage
- Saves metadata to the database

### Data Flow
1. **Image Capture**: Extension captures images from web pages
2. **Upload**: Images are sent to the Vercel API endpoint
3. **Processing**: Azure AI generates titles, descriptions, and tags
4. **Storage**: Images stored in Vercel Blob, metadata in database
5. **Search**: Images become searchable through the web interface

### Smart Filtering
The extension intelligently filters images to avoid saving:
- Small images (< 200x200 pixels)
- Icons and logos (detected by URL patterns)
- Data URLs and inline images
- Decorative elements

## Permissions

The extension requires these permissions:
- `activeTab`: To access the current webpage
- `contextMenus`: To add right-click menu options
- `storage`: To save settings and cache recent images
- `host_permissions`: To access images from all websites

## Development

### File Structure
```
chrome-extension/
├── manifest.json     # Extension configuration
├── background.js     # Service worker for background tasks
├── content.js        # Injected script for webpage interaction
├── popup.html        # Extension popup interface
├── popup.js          # Popup functionality
└── README.md         # This file
```

### Key Components

1. **Background Script** (`background.js`):
   - Handles context menu creation
   - Processes image uploads
   - Manages notifications
   - Communicates with the Vercel API

2. **Content Script** (`content.js`):
   - Detects images on webpages
   - Adds hover save buttons
   - Handles image-to-data-URL conversion
   - Shows in-page notifications

3. **Popup** (`popup.html` + `popup.js`):
   - Displays recently saved images
   - Provides bulk save functionality
   - Manages extension settings
   - Links to the web application

## Troubleshooting

### Common Issues

1. **Images not saving**:
   - Check that your Vercel app is running
   - Verify the app URL in extension settings
   - Check browser console for errors

2. **CORS errors**:
   - Ensure your Next.js app allows requests from chrome-extension://
   - Check that the API endpoint is accessible

3. **Extension not loading**:
   - Verify all files are in the correct location
   - Check Chrome's extension error console
   - Ensure manifest.json is valid

### Debug Mode
1. Go to `chrome://extensions/`
2. Find your extension and click "Details"
3. Click "Inspect views: background page" to debug the background script
4. Use browser dev tools to debug content script

## Privacy & Security

- Images are processed locally and on your own Vercel deployment
- No data is sent to third-party services except Azure OpenAI for processing
- All images are stored in your own Vercel Blob storage
- Extension only accesses images when explicitly requested by user

## Contributing

1. Fork the repository
2. Make your changes
3. Test the extension thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.