const fs = require('fs');
const path = require('path');

// Simple SVG icon with golf theme
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <rect width="192" height="192" fill="#2D5016"/>
  <circle cx="96" cy="96" r="80" fill="#ffffff"/>
  <text x="96" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="#2D5016">⛳</text>
</svg>`;

const svgIcon512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#2D5016"/>
  <circle cx="256" cy="256" r="220" fill="#ffffff"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="220" font-weight="bold" text-anchor="middle" fill="#2D5016">⛳</text>
</svg>`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG files
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svgIcon512);

console.log('SVG icons created successfully!');
console.log('Note: You may want to convert these to PNG format for better compatibility.'); 