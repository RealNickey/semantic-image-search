const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createPNGIcon(size, outputPath) {
  try {
    // Create a simple colored square with rounded corners and text
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">🖼️</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    
    console.log(`Created ${path.basename(outputPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`Error creating ${outputPath}:`, error);
  }
}

async function createIcons() {
  const extensionDir = path.join(__dirname, 'chrome-extension');
  
  // Create the icons
  await createPNGIcon(16, path.join(extensionDir, 'icon16.png'));
  await createPNGIcon(48, path.join(extensionDir, 'icon48.png'));
  await createPNGIcon(128, path.join(extensionDir, 'icon128.png'));
  
  console.log('All PNG icons created successfully!');
}

createIcons().catch(console.error);
