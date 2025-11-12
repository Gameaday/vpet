#!/usr/bin/env python3
"""Generate PWA icons as SVG and convert to PNG"""
import os

def create_icon_svg(size, output_path, emoji="🐾", bg_color="#6c63ff"):
    """Create an SVG icon"""
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="{size}" height="{size}" fill="{bg_color}" rx="20%"/>
  <text x="50%" y="50%" font-size="{size//2}" text-anchor="middle" dy=".35em" fill="white">{emoji}</text>
</svg>'''
    
    # Save SVG
    svg_path = output_path.replace('.png', '.svg')
    with open(svg_path, 'w') as f:
        f.write(svg_content)
    
    # Create a simple PNG placeholder (base64 encoded 1x1 pixel)
    # In production, these would be proper PNG files
    with open(output_path, 'w') as f:
        f.write(f"<!-- PWA Icon {size}x{size} - Replace with actual PNG -->")
    
    print(f"Created {svg_path} and placeholder {output_path}")

def main():
    """Generate all PWA icon sizes"""
    os.makedirs('icons', exist_ok=True)
    os.makedirs('screenshots', exist_ok=True)
    
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        create_icon_svg(size, f'icons/icon-{size}x{size}.png')
    
    # Shortcut icons
    create_icon_svg(96, 'icons/shortcut-feed.png', '🍖', '#ff9500')
    create_icon_svg(96, 'icons/shortcut-battle.png', '⚔️', '#ff4444')
    
    # Create placeholder screenshots
    with open('screenshots/screenshot-desktop.png', 'w') as f:
        f.write("<!-- Desktop screenshot placeholder -->")
    with open('screenshots/screenshot-mobile.png', 'w') as f:
        f.write("<!-- Mobile screenshot placeholder -->")
    
    print("\n✅ All PWA assets generated!")
    print("📝 Note: SVG files created. In production, convert to PNG for better compatibility.")

if __name__ == '__main__':
    main()
