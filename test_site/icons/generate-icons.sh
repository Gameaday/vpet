#!/bin/bash
# Simple placeholder icon generator using ImageMagick convert
# This creates a simple colored circle as placeholder icons

# Check if convert is available
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Creating basic SVG placeholders instead."
    
    # Create SVG icon that can be used
    for size in 72 96 128 144 152 192 384 512; do
        cat > "icon-${size}x${size}.png.svg" << SVGEOF
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#4a69bd" rx="$((size/8))"/>
  <circle cx="$((size/2))" cy="$((size/2))" r="$((size/3))" fill="#fff"/>
  <text x="50%" y="65%" text-anchor="middle" font-size="$((size/8))" fill="#4a69bd" font-weight="bold">VPet</text>
</svg>
SVGEOF
    done
    exit 0
fi

# Generate icons with ImageMagick
for size in 72 96 128 144 152 192 384 512; do
    convert -size ${size}x${size} xc:"#4a69bd" \
        -fill white -draw "circle $((size/2)),$((size/2)) $((size/2)),$((size/6))" \
        -pointsize $((size/5)) -fill "#4a69bd" -gravity center -annotate +0+$((size/10)) "🐾" \
        "icon-${size}x${size}.png"
done

echo "Icons generated successfully!"
