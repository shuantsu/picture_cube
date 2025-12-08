from pathlib import Path
from PIL import Image

bg_dir = Path(__file__).parent.parent / 'dist' / 'backgrounds'
thumbs_dir = bg_dir / 'thumbnails'
thumbs_dir.mkdir(exist_ok=True)

for img_file in bg_dir.glob('*'):
    if img_file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']:
        if img_file.parent.name == 'thumbnails':
            continue
        
        thumb_path = thumbs_dir / f"{img_file.stem}.jpg"
        
        img = Image.open(img_file)
        img = img.convert('RGB')
        
        # Crop to square (center)
        w, h = img.size
        size = min(w, h)
        left = (w - size) // 2
        top = (h - size) // 2
        img = img.crop((left, top, left + size, top + size))
        
        img = img.resize((120, 120), Image.Resampling.LANCZOS)
        img.save(thumb_path, 'JPEG', quality=85, optimize=True)
        
        print(f"Generated: {thumb_path.name}")

print(f"\nDone! Generated {len(list(thumbs_dir.glob('*.jpg')))} thumbnails")
