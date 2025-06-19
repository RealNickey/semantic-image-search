# Image Pocket Chrome Extension

A Chrome extension that acts like Pocket but for images. Save images from any website directly to Vercel Blob storage.

## Features

- **Right-click to save**: Right-click on any image and select "Save to Image Pocket"
- **Hover to save**: Hover over images to see a save button
- **Popup manager**: View all your saved images in a clean popup interface
- **Vercel Blob integration**: Images are stored securely in Vercel Blob
- **Smart filtering**: Only shows save options for images that are large enough (>100x100px)

## Setup

### 1. Install Dependencies

Make sure your Next.js project has the Vercel Blob package:

```bash
npm install @vercel/blob
```

### 2. Environment Variables

Add these environment variables to your `.env.local` file:

```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

### 3. Deploy Your API

Deploy your Next.js application to Vercel so the `/api/upload-image` endpoint is available.

### 4. Configure the Extension

1. Open the Chrome extension popup
2. Click the settings (⚙️) button
3. Enter your API URL: `https://your-project.vercel.app/api/upload-image`
4. Enter your Vercel Blob token (same as BLOB_READ_WRITE_TOKEN)

### 5. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this `chrome-extension` folder
4. The extension should now appear in your extensions bar

## Usage

### Saving Images

**Method 1: Right-click**
1. Right-click on any image on a webpage
2. Select "Save to Image Pocket" from the context menu
3. The image will be uploaded to Vercel Blob

**Method 2: Hover button**
1. Hover over any image on a webpage
2. Click the 📌 pin button that appears in the top-right corner
3. The image will be uploaded to Vercel Blob

### Viewing Saved Images

1. Click the Image Pocket extension icon in your toolbar
2. View all your saved images in a grid layout
3. Click on any image to open it in a new tab
4. Hover over an image and click the × button to delete it

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for handling saves
├── content.js            # Content script for webpage interactions
├── popup.html            # Popup interface HTML
├── popup.js              # Popup interface logic
├── icons/                # Extension icons (16px, 48px, 128px)
└── README.md             # This file
```

## API Endpoint

The extension uses a Next.js API route at `/api/upload-image` that:

- Accepts multipart form data with an image file
- Validates file type and size (max 10MB)
- Uploads to Vercel Blob with a unique filename
- Returns the public URL of the uploaded image

## Security

- All uploads require a Bearer token for authentication
- File type validation ensures only images are uploaded
- File size limits prevent abuse
- CORS headers allow extension access

## Permissions

The extension requires these permissions:

- `storage`: To save image metadata locally
- `activeTab`: To interact with the current webpage
- `contextMenus`: To add right-click menu options
- `tabs`: To open saved images in new tabs
- Host permissions for all URLs to save images from any site

## Troubleshooting

### Images not saving
1. Check that your API endpoint is deployed and accessible
2. Verify your Vercel Blob token is correct in settings
3. Make sure the image is large enough (>100x100px)
4. Check the browser console for error messages

### Extension not loading
1. Make sure all files are in the correct locations
2. Check `chrome://extensions/` for any error messages
3. Try reloading the extension

### API errors
1. Check your Vercel deployment logs
2. Verify the BLOB_READ_WRITE_TOKEN environment variable is set
3. Ensure the API route is properly deployed

## Development

To modify the extension:

1. Make your changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh button on your extension
4. Test your changes

## License

This project is open source and available under the MIT License.
