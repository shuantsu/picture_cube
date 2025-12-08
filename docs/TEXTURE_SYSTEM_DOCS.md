# Picture Cube - Complete Texture System Manual

## Table of Contents
1. [Quick Start](#quick-start)
2. [Unified System (Recommended)](#unified-system-recommended)
3. [Legacy Systems](#legacy-systems)
4. [Advanced Features](#advanced-features)
5. [Complete Examples](#complete-examples)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

The simplest texture configuration:

```json
{
  "textures": {
    "red": "#c41e3a",
    "white": "#ffffff"
  },
  "cube": {
    "U": "textures.red",
    "L": "textures.white"
  }
}
```

**That's it!** The system automatically:
- Detects unified mode (no `mode` field needed)
- Applies textures to all 9 stickers of each face
- Handles inheritance and layering

---

## Unified System (Recommended)

### Structure

```json
{
  "vars": { /* optional: reusable variables */ },
  "textures": { /* texture library */ },
  "cube": { /* face and sticker assignments */ }
}
```

### 1. Texture Library

Define reusable textures:

```json
"textures": {
  "red": "#c41e3a",
  "gradient": "linear-gradient(45deg, red, blue)",
  "star": {
    "background": "url('data:image/svg+xml;utf8,...')",
    "backgroundSize": "80%",
    "backgroundPosition": "center",
    "backgroundRepeat": "no-repeat"
  }
}
```

**Texture Types:**
- **Simple color**: String with hex/CSS color
- **CSS value**: Any valid CSS background value
- **Object**: Full CSS properties for complex styling

### 2. Cube Assignments

Assign textures to faces and stickers:

```json
"cube": {
  "U": "textures.red",           // Whole face
  "U0": "textures.white",        // Individual sticker (0-8)
  "U4": ["textures.red", "textures.star"] // Layered: base + overlay
}
```

**Sticker Numbering (0-8):**
```
0 1 2
3 4 5
6 7 8
```

**Face Names:** U (Up), L (Left), F (Front), R (Right), B (Back), D (Down)

### 3. Key Features

#### A. Sprite Sheets (Auto 3x3 Split)

Use `backgroundImage` to automatically split an image across 9 stickers:

```json
"textures": {
  "photo": {
    "backgroundImage": "url('image.png')"
  }
},
"cube": {
  "U": "textures.photo"  // Automatically splits across U0-U8
}
```

**How it works:**
- System detects `backgroundImage` property
- Automatically sets `backgroundSize: 300% 300%`
- Positions each sticker to show correct portion
- No manual configuration needed

#### B. Layering System

Stack textures using arrays:

```json
"cube": {
  "U": "textures.red",
  "U1": ["textures.red", "textures.star"],  // Red base + star overlay
  "U4": ["textures.red", "textures.circle"] // Red base + circle overlay
}
```

**Layer order:** `[base, overlay]`
- Base: Applied first (usually solid color or sprite)
- Overlay: Applied on top (usually icon/decoration)

#### C. Inheritance

When a face texture exists, individual stickers automatically inherit it as base layer:

```json
"cube": {
  "U": "textures.red",      // All U stickers become red
  "U1": "textures.star"     // Automatically becomes ["textures.red", "textures.star"]
}
```

**These are equivalent:**
```json
// Explicit (manual)
"U1": ["textures.red", "textures.star"]

// Implicit (automatic inheritance)
"U1": "textures.star"  // When "U": "textures.red" exists
```

**How it works:**
- If face assignment exists ("U": "red")
- AND sticker assignment exists ("U1": "star")
- System automatically applies face as base + sticker as overlay
- No need to repeat the base texture name

#### D. Wildcard Selector

Apply texture to all stickers at once:

```json
"cube": {
  "*": "textures.gray",     // All 54 stickers
  "U4": "textures.gold"     // Override center
}
```

**Priority order:**
1. Individual sticker (U0, U1, etc.)
2. Face assignment (U, L, etc.)
3. Wildcard (*)
4. Default (gray)

#### E. Inline Values

Skip texture library for simple cases:

```json
"textures": {},
"cube": {
  "U": "#ffffff",
  "L": "linear-gradient(45deg, red, blue)"
}
```

### 4. Variables System

Define reusable values:

```json
{
  "vars": {
    "U_grad": "radial-gradient(circle, #fff 50%, transparent 50%)",
    "star_svg": "url('data:image/svg+xml;utf8,...')"
  },
  "textures": {
    "U_sprite": {
      "backgroundImage": "$U_grad"
    },
    "star": {
      "background": "$star_svg"
    }
  }
}
```

**Usage:** Prefix variable names with `$` in texture definitions

---

## Legacy Systems

### 1. Face Textures Mode

Apply textures to entire faces:

```json
{
  "mode": "face_textures",
  "textures": {
    "U": {"background": "#ffffff"},
    "L": {"background": "#ff5800"},
    "U_center": {
      "background": "url('logo.svg')",
      "backgroundSize": "100%"
    }
  }
}
```

**Features:**
- `_center` suffix for center sticker (index 4)
- `backgroundImage` for sprite sheets
- `background` for whole-face textures

### 2. Custom Indices Mode

Control individual stickers by ID (0-53):

```json
{
  "mode": "custom_indices",
  "stickers": {
    "0": {"background": "#fff"},
    "1": {"background": "#f00"},
    "4": {"background": "url('center.svg')"}
  }
}
```

**Sticker IDs:**
- U: 0-8
- L: 9-17
- F: 18-26
- R: 27-35
- B: 36-44
- D: 45-53

### 3. Layered Mode

Combine face textures + individual overlays:

```json
{
  "mode": "layered",
  "textures": {
    "U": {"backgroundImage": "url('base.png')"}
  },
  "stickers": {
    "4": {
      "background": "url('overlay.svg')",
      "backgroundSize": "80%"
    }
  }
}
```

**How it works:**
- Face texture applied first (base layer)
- Sticker overlays applied on top
- Multiple `background` layers combined

---

## Advanced Features

### 1. Supercube Patterns

Create orientation-dependent patterns:

```json
{
  "textures": {
    "pochman": {
      "backgroundImage": "url('data:image/svg+xml;base64,...')"
    }
  },
  "cube": {
    "U": "textures.pochman",
    "L": "textures.pochman",
    "F": "textures.pochman",
    "R": "textures.pochman",
    "B": "textures.pochman",
    "D": "textures.pochman"
  }
}
```

Each face gets the same image, but sprite positioning makes each sticker unique.

### 2. Center-Only Customization

Customize only center stickers:

```json
{
  "textures": {
    "base": "#c41e3a",
    "logo": {
      "background": "url('logo.svg')",
      "backgroundSize": "cover"
    }
  },
  "cube": {
    "U": "textures.base",
    "U4": ["textures.base", "textures.logo"],
    "L": "textures.base",
    "L4": ["textures.base", "textures.logo"]
  }
}
```

### 3. Gradient Patterns

```json
{
  "textures": {
    "diagonal": "linear-gradient(45deg, #c41e3a, #ff5800)",
    "radial": "radial-gradient(circle, #fff 50%, #0045ad 100%)",
    "conic": "conic-gradient(from 0deg, red, yellow, green, blue, red)"
  }
}
```

### 4. Data URLs

Embed images directly:

```json
{
  "textures": {
    "star": {
      "background": "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"%23ffd700\" d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/></svg>')",
      "backgroundSize": "90%",
      "backgroundPosition": "center",
      "backgroundRepeat": "no-repeat"
    }
  }
}
```

**Note:** URL-encode special characters (`#` → `%23`)

---

## Complete Examples

### Example 1: Simple Solid Colors

```json
{
  "textures": {
    "white": "#ffffff",
    "orange": "#ff5800",
    "green": "#009b48",
    "red": "#c41e3a",
    "blue": "#0045ad",
    "yellow": "#ffd500"
  },
  "cube": {
    "U": "textures.white",
    "L": "textures.orange",
    "F": "textures.green",
    "R": "textures.red",
    "B": "textures.blue",
    "D": "textures.yellow"
  }
}
```

### Example 2: Rounded Stickers

```json
{
  "textures": {
    "white": "radial-gradient(#ffffff 90%, black 95%)",
    "orange": "radial-gradient(#ff5800 90%, black 95%)",
    "green": "radial-gradient(#009b48 90%, black 95%)",
    "red": "radial-gradient(#c41e3a 90%, black 95%)",
    "blue": "radial-gradient(#0045ad 90%, black 95%)",
    "yellow": "radial-gradient(#ffd500 90%, black 95%)"
  },
  "cube": {
    "U": "textures.white",
    "L": "textures.orange",
    "F": "textures.green",
    "R": "textures.red",
    "B": "textures.blue",
    "D": "textures.yellow"
  }
}
```

### Example 3: Logo on Center

```json
{
  "textures": {
    "white": "radial-gradient(#ffffff 90%, black 95%)",
    "logo": {
      "background": "url('logo.svg'), radial-gradient(#ffffff 90%, black 95%)",
      "backgroundSize": "100%",
      "backgroundRepeat": "no-repeat",
      "backgroundPosition": "center"
    }
  },
  "cube": {
    "U": "textures.white",
    "U4": "textures.logo"
  }
}
```

### Example 4: Star Pattern

```json
{
  "textures": {
    "red": "#c41e3a",
    "white": "#eee",
    "star": {
      "background": "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"%23ffd700\" d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/></svg>')",
      "backgroundSize": "90%",
      "backgroundPosition": "center",
      "backgroundRepeat": "no-repeat"
    }
  },
  "cube": {
    "U": "textures.red",
    "F": "textures.red",
    "R": "textures.red",
    "L": "textures.white",
    "B": "textures.white",
    "D": "textures.white",
    "U1": ["textures.red", "textures.star"],
    "L1": ["textures.white", "textures.star"],
    "D1": ["textures.white", "textures.star"],
    "F3": ["textures.red", "textures.star"],
    "R7": ["textures.red", "textures.star"],
    "B3": ["textures.white", "textures.star"]
  }
}
```

### Example 5: Circle Supercube

```json
{
  "vars": {
    "U_grad": "radial-gradient(circle, #ffffff 50%, transparent 50%), conic-gradient(from -45deg at center, #0045ad 0deg 90deg, #c41e3a 90deg 180deg, #009b48 180deg 270deg, #ff5800 270deg 360deg)"
  },
  "textures": {
    "U_sprite": {"backgroundImage": "$U_grad"},
    "U_full": {"background": "$U_grad", "backgroundSize": "100% 100%"}
  },
  "cube": {
    "U": "U_sprite",
    "U4": "U_full"
  }
}
```

### Example 6: Pochman Supercube

```json
{
  "vars": {
    "U_img": "url('data:image/svg+xml;base64,PHN2Zy...')"
  },
  "textures": {
    "U_sprite": {"backgroundImage": "$U_img"},
    "U_full": {"background": "$U_img", "backgroundSize": "cover"}
  },
  "cube": {
    "U": "U_sprite",
    "L": "L_sprite",
    "F": "F_sprite",
    "R": "R_sprite",
    "B": "B_sprite",
    "D": "D_sprite",
    "U4": "U_full",
    "L4": "L_full",
    "F4": "F_full",
    "R4": "R_full",
    "B4": "B_full",
    "D4": "D_full"
  }
}
```

---

## Troubleshooting

### Image not spreading across face?

**Problem:** Image appears on each sticker instead of splitting

**Solution:** Use `backgroundImage` (not `background`)

```json
// ❌ Wrong
"texture": {
  "background": "url('image.png')"
}

// ✅ Correct
"texture": {
  "backgroundImage": "url('image.png')"
}
```

### Stickers not inheriting face texture?

**Problem:** Individual stickers don't show face color

**Solution:** Define face first, then override stickers

```json
"cube": {
  "U": "red",        // Define face first
  "U1": "star"       // Then override (inherits red)
}
```

### Overlay not showing?

**Problem:** Second layer in array doesn't appear

**Solution:** Ensure overlay uses `background` property

```json
"star": {
  "background": "url('star.svg')",  // Not backgroundImage
  "backgroundSize": "80%"
}
```

### Want same image on each sticker?

**Problem:** Need image repeated, not split

**Solution:** Use `background` with `backgroundSize: cover`

```json
// ❌ Wrong (splits image)
"texture": {
  "backgroundImage": "url('logo.svg')"
}

// ✅ Correct (repeats on each)
"texture": {
  "background": "url('logo.svg')",
  "backgroundSize": "cover"
}
```

### Colors look wrong after moves?

**Problem:** Textures don't follow stickers

**Solution:** This is a bug. Textures should follow stickers automatically. Report if this happens.

### JSON syntax error?

**Common mistakes:**
- Missing commas between properties
- Trailing comma on last item
- Unescaped quotes in strings
- Comments (use `//` or `/* */` - they're stripped automatically)

**Tip:** Use a JSON validator or the browser console to check syntax

### Variable not working?

**Problem:** `$variable` shows as literal text

**Solution:** Ensure variable is defined in `vars` section

```json
{
  "vars": {
    "myColor": "#ff0000"
  },
  "textures": {
    "red": "$myColor"  // ✅ Works
  }
}
```

---

## Technical Details

### How Sprite Sheets Work

When `backgroundImage` is detected:
1. System sets `backgroundSize: 300% 300%`
2. For each sticker (0-8), calculates position:
   - Row: `Math.floor(index / 3)`
   - Col: `index % 3`
   - Position: `${col * 50}% ${row * 50}%`
3. Each sticker shows 1/9th of the image

### Texture Resolution Order

1. Check `cube` assignments for sticker (e.g., `U1`)
2. If not found, check face assignment (e.g., `U`)
3. If not found, check wildcard (`*`)
4. If not found, use default gray
5. Look up texture name in `textures` library
6. If not found, use value as-is (inline)

### Layer Application

For arrays `["base", "overlay"]`:
1. Apply base texture to element
2. If base has `backgroundImage`, apply sprite positioning
3. Apply overlay as additional `backgroundImage` layer
4. Combine using CSS multiple backgrounds

### Sticker Rotation

Textures rotate with stickers during moves:
- Each sticker tracks rotation (0-3, representing 0°, 90°, 180°, 270°)
- CSS `transform: rotate()` applied to sticker element
- Textures rotate with the element automatically

---

## Migration Guide

### From face_textures to Unified

```json
// OLD
{
  "mode": "face_textures",
  "textures": {
    "U": {"background": "#fff"}
  }
}

// NEW
{
  "textures": {
    "white": "#fff"
  },
  "cube": {
    "U": "white"
  }
}
```

### From custom_indices to Unified

```json
// OLD
{
  "mode": "custom_indices",
  "stickers": {
    "0": "#fff",
    "1": "#f00"
  }
}

// NEW
{
  "textures": {
    "w": "#fff",
    "r": "#f00"
  },
  "cube": {
    "U0": "w",
    "U1": "r"
  }
}
```

### From layered to Unified

```json
// OLD
{
  "mode": "layered",
  "textures": {
    "U": {"backgroundImage": "url('base.png')"}
  },
  "stickers": {
    "4": {"background": "url('overlay.svg')"}
  }
}

// NEW
{
  "textures": {
    "base": {"backgroundImage": "url('base.png')"},
    "overlay": {"background": "url('overlay.svg')"}
  },
  "cube": {
    "U": "base",
    "U4": ["base", "overlay"]
  }
}
```

---

## Best Practices

1. **Use unified system** for new configurations
2. **Define textures once** in library, reference multiple times
3. **Use variables** for complex/repeated values
4. **Name textures descriptively** (not "tex1", "tex2")
5. **Test after moves** to ensure textures follow stickers
6. **Use data URLs** for small images to avoid external dependencies
7. **Optimize images** before embedding (compress SVGs, use base64 for small PNGs)
8. **Comment your JSON** to document complex configurations
9. **Start simple** and add complexity gradually
10. **Validate JSON** before applying to catch syntax errors

---

## FAQ

**Q: Can I use external image URLs?**
A: Yes, but data URLs are recommended for portability.

**Q: What image formats are supported?**
A: Any format supported by CSS `background-image` (PNG, JPG, SVG, GIF, WebP).

**Q: Can I animate textures?**
A: Not directly. CSS animations on background properties may work but aren't officially supported.

**Q: How many layers can I stack?**
A: Two layers: base + overlay. More layers are ignored.

**Q: Do textures persist after scrambling?**
A: Yes, textures follow stickers through all moves.

**Q: Can I use transparency?**
A: Yes, use RGBA colors or transparent PNGs/SVGs.

**Q: What's the performance impact?**
A: Minimal for solid colors. Complex gradients/images may affect performance on older devices.

**Q: Can I export my configuration?**
A: Copy the JSON from the textarea and save it as a `.json` file.

**Q: Are there size limits?**
A: No hard limits, but large base64 images may cause browser slowdown.

**Q: Can I share my texture configurations?**
A: Yes! Save as JSON and share the file.

---

## Version History

- **v2.0** - Unified system introduced (current)
- **v1.2** - Layered mode added
- **v1.1** - Custom indices mode added
- **v1.0** - Face textures mode (legacy)

---

## Support

For issues, questions, or contributions:
- GitHub: https://github.com/shuantsu/picture_cube
- Live Demo: https://filipeteixeira.com.br/new/picturecube/

---

**Last Updated:** 2024
**System Version:** Unified v2.0
