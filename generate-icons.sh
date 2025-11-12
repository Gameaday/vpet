#!/bin/bash
# Generate PWA icons using ImageMagick
# This script creates placeholder icons with the VPet logo

# Base icon (using pet emoji as placeholder)
SIZES=(72 96 128 144 152 192 384 512)

for size in "${SIZES[@]}"; do
  # Create a simple icon with pet emoji and background
  convert -size ${size}x${size} xc:"#6c63ff" \
    -gravity center \
    -pointsize $((size / 2)) \
    -font "DejaVu-Sans" \
    -fill white \
    -annotate +0+0 "🐾" \
    "icons/icon-${size}x${size}.png"
  
  echo "Created icons/icon-${size}x${size}.png"
done

# Create shortcut icons
convert -size 96x96 xc:"#ff9500" \
  -gravity center \
  -pointsize 48 \
  -font "DejaVu-Sans" \
  -fill white \
  -annotate +0+0 "🍖" \
  "icons/shortcut-feed.png"

convert -size 96x96 xc:"#ff4444" \
  -gravity center \
  -pointsize 48 \
  -font "DejaVu-Sans" \
  -fill white \
  -annotate +0+0 "⚔️" \
  "icons/shortcut-battle.png"

echo "✅ All PWA icons generated successfully!"
