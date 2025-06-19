#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Image Pocket Chrome Extension...\n');

// Check if we're in the right directory
if (!fs.existsSync('chrome-extension')) {
  console.error('❌ Error: chrome-extension directory not found!');
  console.log('Please run this script from the root of your project.');
  process.exit(1);
}

// Create placeholder icons
const iconSizes = [16, 48, 128];
const iconDir = path.join('chrome-extension', 'icons');

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

iconSizes.forEach(size => {
  const iconPath = path.join(iconDir, `icon${size}.png`);
  if (!fs.existsSync(iconPath)) {
    // Create a simple SVG icon and save as PNG (placeholder)
    const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#667eea" rx="8"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="system-ui" font-size="${Math.floor(size * 0.4)}" fill="white">📷</text>
    </svg>`;
    
    // For now, just create a placeholder file
    fs.writeFileSync(iconPath, `Placeholder for ${size}x${size} icon`);
    console.log(`📱 Created placeholder for icon${size}.png`);
  }
});

// Check if API route exists
const apiRoute = path.join('app', 'api', 'upload-image', 'route.ts');
if (fs.existsSync(apiRoute)) {
  console.log('✅ API route found: /api/upload-image');
} else {
  console.log('❌ API route not found: /api/upload-image');
  console.log('Please make sure the API route is properly created.');
}

// Check for required environment variables
const envExample = path.join('.env.example');
const envLocal = path.join('.env.local');

if (fs.existsSync(envLocal)) {
  const envContent = fs.readFileSync(envLocal, 'utf8');
  if (envContent.includes('BLOB_READ_WRITE_TOKEN')) {
    console.log('✅ Environment variables configured');
  } else {
    console.log('⚠️  Add BLOB_READ_WRITE_TOKEN to your .env.local file');
  }
} else {
  console.log('⚠️  Create .env.local file with BLOB_READ_WRITE_TOKEN');
}

console.log('\n🎉 Setup complete! Next steps:');
console.log('1. Deploy your Next.js app to Vercel');
console.log('2. Get your Vercel Blob token from the Vercel dashboard');
console.log('3. Add BLOB_READ_WRITE_TOKEN to your .env.local file');
console.log('4. Load the extension in Chrome:');
console.log('   - Go to chrome://extensions/');
console.log('   - Enable Developer mode');
console.log('   - Click "Load unpacked"');
console.log('   - Select the chrome-extension folder');
console.log('5. Configure the extension settings with your API URL and token');
console.log('\n📖 See chrome-extension/README.md for detailed instructions');
