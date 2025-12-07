#!/usr/bin/env python3
from PIL import Image
import os
from pathlib import Path

INPUT_DIR = Path("dist/backgrounds")
OUTPUT_DIR = Path("dist/backgrounds/optimized")
MAX_WIDTH = 1920
QUALITY = 85

OUTPUT_DIR.mkdir(exist_ok=True)

for img_path in INPUT_DIR.glob("*"):
    if img_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
        continue
    
    print(f"Processing {img_path.name}...")
    
    with Image.open(img_path) as img:
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            new_size = (MAX_WIDTH, int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        output_path = OUTPUT_DIR / f"{img_path.stem}.jpg"
        img.save(output_path, 'JPEG', quality=QUALITY, optimize=True)
        
        original_size = img_path.stat().st_size / 1024
        optimized_size = output_path.stat().st_size / 1024
        savings = ((original_size - optimized_size) / original_size) * 100
        
        print(f"  {original_size:.1f}KB → {optimized_size:.1f}KB ({savings:.1f}% saved)")

print(f"\nOptimized images saved to {OUTPUT_DIR}")
