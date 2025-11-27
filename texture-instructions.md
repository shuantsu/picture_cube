# Custom Textures Documentation

## Overview
The Custom Textures system allows you to apply CSS backgrounds to cube stickers using JSON configuration. There are two modes available:

## Mode 1: Face Textures (`face_textures`)
Apply textures to entire faces or individual stickers within faces.

### Basic Face Texture
```json
{
  "mode": "face_textures",
  "textures": {
    "U": {"background": "linear-gradient(45deg, red, yellow)"},
    "F": {"background": "radial-gradient(circle, blue, white)"},
    "R": {"background": "conic-gradient(red, yellow, green, blue)"}
  }
}
```

### Sprite Sheet Textures
For image-based textures that use sprite positioning:
```json
{
  "mode": "face_textures", 
  "textures": {
    "U": {
      "backgroundImage": "url('https://example.com/sprite.png')",
      "backgroundSize": "300% 300%"
    }
  }
}
```

### Center-Specific Textures
Apply different textures to center stickers:
```json
{
  "mode": "face_textures",
  "textures": {
    "U": {"background": "linear-gradient(45deg, red, yellow)"},
    "U_center": {"background": "radial-gradient(circle, white, blue)"}
  }
}
```

## Mode 2: Custom Indices (`custom_indices`)
Apply textures to specific sticker IDs regardless of position.

```json
{
  "mode": "custom_indices",
  "stickers": {
    "0": {"background": "linear-gradient(90deg, red, blue)"},
    "9": {"background": "url('texture.jpg')"},
    "18": {"background": "conic-gradient(from 45deg, red, yellow, green)"}
  }
}
```

## CSS Properties Supported
- `background`: Any CSS background shorthand
- `backgroundImage`: Images, gradients
- `backgroundSize`: Size control
- `backgroundPosition`: Position control
- `backgroundRepeat`: Repeat behavior

## Examples

### Rainbow Cube
```json
{
  "mode": "face_textures",
  "textures": {
    "U": {"background": "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00)"},
    "L": {"background": "linear-gradient(45deg, #00ff00, #0000ff, #4b0082)"},
    "F": {"background": "linear-gradient(45deg, #9400d3, #ff1493, #00ced1)"},
    "R": {"background": "conic-gradient(red, orange, yellow, green, blue, indigo, violet)"},
    "B": {"background": "radial-gradient(circle, #ff6b6b, #4ecdc4, #45b7d1)"},
    "D": {"background": "linear-gradient(135deg, #667eea, #764ba2, #f093fb)"}
  }
}
```

### Picture Cube (Complex Sprite Design)
```json
{
  "mode": "face_textures",
  "textures": {
    "U": { 
      "backgroundImage": "radial-gradient(circle, white 50%, transparent 50%), conic-gradient(from -45deg at center, blue 0deg 90deg, red 90deg 180deg, green 180deg 270deg, orange 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "U_center": {
      "background": "radial-gradient(circle, white 50%, transparent 50%), conic-gradient(from -45deg at center, blue 0deg 90deg, red 90deg 180deg, green 180deg 270deg, orange 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "L": { 
      "backgroundImage": "radial-gradient(circle, orange 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, green 90deg 180deg, yellow 180deg 270deg, blue 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "L_center": {
      "background": "radial-gradient(circle, orange 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, green 90deg 180deg, yellow 180deg 270deg, blue 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "F": { 
      "backgroundImage": "radial-gradient(circle, green 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, red 90deg 180deg, yellow 180deg 270deg, orange 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "F_center": {
      "background": "radial-gradient(circle, green 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, red 90deg 180deg, yellow 180deg 270deg, orange 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "R": { 
      "backgroundImage": "radial-gradient(circle, red 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, blue 90deg 180deg, yellow 180deg 270deg, green 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "R_center": {
      "background": "radial-gradient(circle, red 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, blue 90deg 180deg, yellow 180deg 270deg, green 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "B": { 
      "backgroundImage": "radial-gradient(circle, blue 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, orange 90deg 180deg, yellow 180deg 270deg, red 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "B_center": {
      "background": "radial-gradient(circle, blue 50%, transparent 50%), conic-gradient(from -45deg at center, white 0deg 90deg, orange 90deg 180deg, yellow 180deg 270deg, red 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "D": { 
      "backgroundImage": "radial-gradient(circle, yellow 50%, transparent 50%), conic-gradient(from -45deg at center, green 0deg 90deg, red 90deg 180deg, blue 180deg 270deg, orange 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "D_center": {
      "background": "radial-gradient(circle, yellow 50%, transparent 50%), conic-gradient(from -45deg at center, green 0deg 90deg, red 90deg 180deg, blue 180deg 270deg, orange 270deg 360deg)",
      "backgroundSize": "100% 100%"
    }
  }
}
```

### Metallic Cube
```json
{
  "mode": "face_textures",
  "textures": {
    "U": {"background": "linear-gradient(145deg, #c0c0c0, #808080, #404040)"},
    "L": {"background": "linear-gradient(145deg, #ffd700, #b8860b, #8b7355)"},
    "F": {"background": "linear-gradient(145deg, #cd7f32, #8b4513, #654321)"},
    "R": {"background": "linear-gradient(145deg, #e5e5e5, #a9a9a9, #696969)"},
    "B": {"background": "linear-gradient(145deg, #2f4f4f, #708090, #b0c4de)"},
    "D": {"background": "linear-gradient(145deg, #800080, #4b0082, #191970)"}
  }
}
```

## Tips
- Use `face_textures` for consistent face-based designs
- Use `custom_indices` for complex patterns across multiple faces
- Combine gradients with different angles for dynamic effects
- Test textures in both 2D and 3D views
- Remember that stickers rotate and move with cube operations