# Custom Textures Documentation

## Overview
The Custom Textures system allows you to apply CSS backgrounds to cube stickers using JSON configuration. There are two modes available:

## Mode 1: Face Textures (`face_textures`)
Apply textures to entire faces or individual stickers within faces.

### Basic Face Texture
[Try this →](#try-example)
```json
{
  "mode": "face_textures",
  "textures": {
    "U": {"background": "radial-gradient(#ffffff 90%, black 95%)"},
    "L": {"background": "radial-gradient(#ff5800 90%, black 95%)"},
    "F": {"background": "radial-gradient(#009b48 90%, black 95%)"},
    "R": {"background": "radial-gradient(#c41e3a 90%, black 95%)"},
    "B": {"background": "radial-gradient(#0045ad 90%, black 95%)"},
    "D": {"background": "radial-gradient(#ffd500 90%, black 95%)"},
    "U_center": {
      "background": "url('https://filipeteixeira.com.br/rubiksim/moyulogo.svg'), radial-gradient(#ffffff 90%, black 95%)",
      "backgroundSize": "100%",
      "backgroundRepeat": "no-repeat",
      "backgroundPosition": "center"
    }
  }
}
```

### Sprite Sheet Textures
For image-based textures that use sprite positioning:
[Try this →](#try-example)
```json
{
  "mode": "face_textures", 
  "textures": {
    "U": {
      "backgroundImage": "url('texture.png')",
      "backgroundSize": "300% 300%"
    }
  }
}
```

### Center-Specific Textures
Apply different textures to center stickers:
[Try this →](#try-example)
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

[Try this →](#try-example)
```json
{
  "mode": "custom_indices",
  "stickers": {
    "11": {"background": "linear-gradient(90deg, white, black)"},
    "6": {"background": "url('texture.png')", "backgroundSize": "100% 100%"},
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
[Try this →](#try-example)
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

### Circle Super Cube (Complex Spritesheet Gradient Design)
[Try this →](#try-example)
```json
{
  "mode": "face_textures",
  "textures": {
    "U": { 
      "backgroundImage": "radial-gradient(circle, #ffffff 50%, transparent 50%), conic-gradient(from -45deg at center, #0045ad 0deg 90deg, #c41e3a 90deg 180deg, #009b48 180deg 270deg, #ff5800 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "U_center": {
      "background": "radial-gradient(circle, #ffffff 50%, transparent 50%), conic-gradient(from -45deg at center, #0045ad 0deg 90deg, #c41e3a 90deg 180deg, #009b48 180deg 270deg, #ff5800 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "L": { 
      "backgroundImage": "radial-gradient(circle, #ff5800 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #009b48 90deg 180deg, #ffd500 180deg 270deg, #0045ad 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "L_center": {
      "background": "radial-gradient(circle, #ff5800 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #009b48 90deg 180deg, #ffd500 180deg 270deg, #0045ad 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "F": { 
      "backgroundImage": "radial-gradient(circle, #009b48 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #c41e3a 90deg 180deg, #ffd500 180deg 270deg, #ff5800 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "F_center": {
      "background": "radial-gradient(circle, #009b48 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #c41e3a 90deg 180deg, #ffd500 180deg 270deg, #ff5800 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "R": { 
      "backgroundImage": "radial-gradient(circle, #c41e3a 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #0045ad 90deg 180deg, #ffd500 180deg 270deg, #009b48 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "R_center": {
      "background": "radial-gradient(circle, #c41e3a 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #0045ad 90deg 180deg, #ffd500 180deg 270deg, #009b48 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "B": { 
      "backgroundImage": "radial-gradient(circle, #0045ad 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #ff5800 90deg 180deg, #ffd500 180deg 270deg, #c41e3a 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "B_center": {
      "background": "radial-gradient(circle, #0045ad 50%, transparent 50%), conic-gradient(from -45deg at center, #ffffff 0deg 90deg, #ff5800 90deg 180deg, #ffd500 180deg 270deg, #c41e3a 270deg 360deg)",
      "backgroundSize": "100% 100%"
    },
    "D": { 
      "backgroundImage": "radial-gradient(circle, #ffd500 50%, transparent 50%), conic-gradient(from -45deg at center, #009b48 0deg 90deg, #c41e3a 90deg 180deg, #0045ad 180deg 270deg, #ff5800 270deg 360deg)",
      "backgroundSize": "300% 300%"
    },
    "D_center": {
      "background": "radial-gradient(circle, #ffd500 50%, transparent 50%), conic-gradient(from -45deg at center, #009b48 0deg 90deg, #c41e3a 90deg 180deg, #0045ad 180deg 270deg, #ff5800 270deg 360deg)",
      "backgroundSize": "100% 100%"
    }
  }
}
```

### Metallic Cube
[Try this →](#try-example)
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