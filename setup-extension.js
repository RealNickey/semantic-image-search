#!/usr/bin/env node

/**
 * Setup script for Image Pocket Chrome Extension
 * This script helps prepare the Chrome extension for development and production
 */

const fs = require('fs');
const path = require('path');

const EXTENSION_DIR = path.join(__dirname, 'chrome-extension');
const MANIFEST_PATH = path.join(EXTENSION_DIR, 'manifest.json');

console.log('🚀 Setting up Image Pocket Chrome Extension...\n');

// Check if chrome-extension directory exists
if (!fs.existsSync(EXTENSION_DIR)) {
  console.error('❌ Chrome extension directory not found!');
  console.log('Expected directory:', EXTENSION_DIR);
  process.exit(1);
}

// Check if all required files exist
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'README.md'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(EXTENSION_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing. Please ensure all files are created.');
  process.exit(1);
}

// Read and validate manifest.json
console.log('\n🔍 Validating manifest.json...');
try {
  const manifestContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(manifestContent);
  
  // Check required fields
  const requiredFields = ['manifest_version', 'name', 'version', 'description'];
  requiredFields.forEach(field => {
    if (!manifest[field]) {
      console.log(`⚠️  Missing required field: ${field}`);
    } else {
      console.log(`✅ ${field}: ${manifest[field]}`);
    }
  });
  
  // Check permissions
  if (manifest.permissions) {
    console.log(`✅ Permissions: ${manifest.permissions.join(', ')}`);
  }
  
  // Check host permissions
  if (manifest.host_permissions) {
    console.log(`✅ Host permissions: ${manifest.host_permissions.join(', ')}`);
  }
  
} catch (error) {
  console.error('❌ Error reading manifest.json:', error.message);
  process.exit(1);
}

// Create placeholder icons if they don't exist
console.log('\n🎨 Checking extension icons...');
const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(EXTENSION_DIR, `icon${size}.png`);
  if (!fs.existsSync(iconPath)) {
    // Create a simple text file as placeholder
    const placeholderContent = `Placeholder for ${size}x${size} icon
To add a real icon:
1. Create a ${size}x${size} PNG image
2. Name it icon${size}.png
3. Place it in the chrome-extension directory`;
    
    fs.writeFileSync(iconPath.replace('.png', '.txt'), placeholderContent);
    console.log(`⚠️  Created placeholder for icon${size}.png`);
  } else {
    console.log(`✅ icon${size}.png exists`);
  }
});

// Check if Next.js app is set up
console.log('\n🌐 Checking Next.js app setup...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`✅ Next.js app: ${packageJson.name} v${packageJson.version}`);
  
  // Check if required dependencies are installed
  const requiredDeps = ['@vercel/blob', '@ai-sdk/azure', 'ai'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`⚠️  Missing dependency: ${dep}`);
    }
  });
} else {
  console.log('⚠️  package.json not found in root directory');
}

// Check API routes
console.log('\n🛠️  Checking API routes...');
const apiRoutes = [
  'app/api/upload/route.ts',
  'app/api/extension/route.ts'
];

apiRoutes.forEach(route => {
  const routePath = path.join(__dirname, route);
  if (fs.existsSync(routePath)) {
    console.log(`✅ ${route}`);
  } else {
    console.log(`⚠️  ${route} - Not found`);
  }
});

// Display installation instructions
console.log('\n' + '='.repeat(60));
console.log('📝 INSTALLATION INSTRUCTIONS');
console.log('='.repeat(60));
console.log(`
1. Start your Next.js development server:
   npm run dev
   # or
   pnpm dev

2. Open Chrome and navigate to:
   chrome://extensions/

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" button

5. Select this directory:
   ${EXTENSION_DIR}

6. The extension should now appear in your Chrome toolbar

7. Click the extension icon to configure your Vercel app URL

8. Start saving images from any website!
`);

console.log('='.repeat(60));
console.log('📚 USAGE TIPS');
console.log('='.repeat(60));
console.log(`
• Right-click any image → "Save image to Pocket"
• Hover over images to see quick save button
• Use extension popup to save all images from a page
• View saved images in the extension popup
• Access full search interface via "Open Web App" button
`);

console.log('='.repeat(60));
console.log('🔧 TROUBLESHOOTING');
console.log('='.repeat(60));
console.log(`
• If images aren't saving, check your Vercel app URL in extension settings
• For CORS issues, ensure your Next.js app is running
• Check browser console for any JavaScript errors
• Verify your .env.local file has required API keys
`);

console.log('\n✨ Setup complete! Your Image Pocket Chrome Extension is ready to use.');