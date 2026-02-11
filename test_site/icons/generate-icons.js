// Icon generation script using Canvas API
// This creates simple placeholder icons with the pet emoji
// For production, replace with actual designed icons

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple icon with emoji
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#16213e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw rounded rectangle
  const radius = size * 0.1;
  ctx.strokeStyle = '#53a8b6';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.stroke();

  // Draw pet symbol (circle for simplicity)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Add paw print emoji styling
  ctx.fillStyle = '#53a8b6';
  ctx.font = `${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐾', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

// Generate all icon sizes
sizes.forEach(size => {
  const buffer = generateIcon(size);
  fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
  console.log(`Generated icon-${size}x${size}.png`);
});

console.log('All icons generated!');
