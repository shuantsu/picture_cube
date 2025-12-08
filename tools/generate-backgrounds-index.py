import json
from pathlib import Path

bg_dir = Path(__file__).parent.parent / 'dist' / 'backgrounds'
files = sorted([f.name for f in bg_dir.glob('*') if f.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] and f.parent.name != 'thumbnails'])

(bg_dir / 'index.json').write_text(json.dumps(files))
print(f"Generated index.json with {len(files)} backgrounds")
