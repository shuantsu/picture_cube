# Picture Cube Texture System Documentation

## ✅ UNIFIED SYSTEM (RECOMMENDED)

The unified system is the **simplest and most powerful** way to texture your cube.

### Basic Usage

```json
{
  "textures": {
    "red": "#c41e3a",
    "myImage": {
      "backgroundImage": "url('image.png')"
    }
  },
  "cube": {
    "U": "red",
    "L": "myImage"
  }
}
```

### Key Features

✅ **No mode needed** - Auto-detected when you use `textures` + `cube`
✅ **Auto sprite sheets** - `backgroundImage` automatically spreads across 9 stickers
✅ **Simple colors** - Just use hex codes or CSS colors
✅ **Layering** - Use arrays for base + overlay: `["base", "overlay"]`
✅ **Wildcards** - Use `"*"` to set all stickers at once
✅ **Inheritance** - Individual stickers inherit face textures

---

## Legacy System Issues (face_textures, layered, custom_indices)

### 1. **Mode Confusion**
- `face_textures`: Works with face-level textures
- `layered`: Combines face textures + individual stickers  
- `custom_indices`: Individual sticker control only

**Problem**: Users need to understand 3 different modes with different behaviors.

### 2. **Property Inconsistencies**
- `background` vs `backgroundImage` behave differently
- `backgroundImage` uses sprite positioning in some modes but not others
- Center stickers use `_center` suffix but only in some modes

### 3. **Variable System Limitations**
- Variables work but syntax is inconsistent with JSON standards
- No validation or error handling for missing variables

## Unified System Examples

### Example 1: Simple Colors
```json
{
  "textures": {
    "white": "#ffffff",
    "orange": "#ff5800",
    "green": "#009b48"
  },
  "cube": {
    "U": "white",
    "L": "orange",
    "F": "green"
  }
}
```

### Example 2: Image Sprite (Auto 3x3)
```json
{
  "textures": {
    "photo": {
      "backgroundImage": "url('data:image/png;base64,...')"
    }
  },
  "cube": {
    "U": "photo"
  }
}
```

### Example 3: Layered (Base + Overlay)
```json
{
  "textures": {
    "red": "#c41e3a",
    "star": {
      "background": "url('star.svg')",
      "backgroundSize": "60%",
      "backgroundPosition": "center",
      "backgroundRepeat": "no-repeat"
    }
  },
  "cube": {
    "U": "red",
    "U1": ["red", "star"],
    "U3": ["red", "star"]
  }
}
```

### Example 4: Wildcard + Overrides
```json
{
  "textures": {
    "gray": "#888888",
    "gold": "#ffd700"
  },
  "cube": {
    "*": "gray",
    "U4": "gold",
    "L4": "gold"
  }
}
```

### Example 5: Inline Values
```json
{
  "textures": {},
  "cube": {
    "U": "#ffffff",
    "L": "linear-gradient(45deg, red, blue)"
  }
}
```

## Complete Example: Supercube

```json
{
  "textures": {
    "pochman": {
      "backgroundImage": "url('data:image/svg+xml;base64,PHN2Zy...')"
    }
  },
  "cube": {
    "U": "pochman",
    "L": "pochman",
    "F": "pochman",
    "R": "pochman",
    "B": "pochman",
    "D": "pochman"
  }
}
```

That's it! One image, all 6 faces, perfectly positioned.

---

## Troubleshooting

### Image not spreading across face?
✅ Use `backgroundImage` (not `background`)
✅ System auto-applies 300% 300% sizing

### Stickers not inheriting face texture?
✅ Define face first: `"U": "base"`
✅ Then override: `"U1": "overlay"` or `"U1": ["base", "overlay"]`

### Wildcard not working?
✅ Use `"*": "texture"` in cube assignments
✅ Individual assignments override wildcard

### Want same image on each sticker?
❌ Don't use `backgroundImage`
✅ Use `background` with `backgroundSize: cover`

## How It Works

### Texture Resolution
1. System checks for `textures` + `cube` keys → Unified mode
2. Looks up texture name in library
3. If not found, uses value as-is (inline)
4. Auto-detects `backgroundImage` → sprite sheet mode
5. Applies positioning automatically

### Sticker Positioning (0-8)
```
0 1 2
3 4 5
6 7 8
```

### Priority Order
1. Individual sticker (`U1`, `U2`, etc.)
2. Face assignment (`U`, `L`, etc.)
3. Wildcard (`*`)
4. Default (gray)

### Sprite Sheet Auto-Positioning
When texture has `backgroundImage`:
- Automatically sets `backgroundSize: 300% 300%`
- Positions each sticker to show correct portion
- No manual configuration needed

---

## Migration from Legacy Modes

### From face_textures:
```json
// OLD
{"mode": "face_textures", "textures": {"U": {"background": "#fff"}}}

// NEW
{"textures": {"white": "#fff"}, "cube": {"U": "white"}}
```

### From layered:
```json
// OLD
{"mode": "layered", "textures": {"U": {...}}, "stickers": {"1": {...}}}

// NEW
{"textures": {"base": {...}, "overlay": {...}}, "cube": {"U": "base", "U1": ["base", "overlay"]}}
```

### From custom_indices:
```json
// OLD
{"mode": "custom_indices", "stickers": {"0": "#fff", "1": "#f00"}}

// NEW
{"textures": {"w": "#fff", "r": "#f00"}, "cube": {"U0": "w", "U1": "r"}}
```