import json
from pathlib import Path

examples_dir = Path(__file__).parent.parent / 'dist' / 'examples'
files = sorted([f.name for f in examples_dir.glob('*.json') if f.name != 'index.json'])

(examples_dir / 'index.json').write_text(json.dumps(files))
print(f"Generated index.json with {len(files)} files")
