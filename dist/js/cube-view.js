// Cube View - Rendering abstraction layer
class CubeView {
  constructor(container, renderer) {
    this.container = container;
    this.renderer = renderer;
  }

  render(cubeState, stickerRotations, stickerTextures, textureConfig) {
    this.renderer.render(cubeState, stickerRotations, stickerTextures, textureConfig);
  }

  setRotation(x, y) {
    if (this.renderer.setRotation) {
      this.renderer.setRotation(x, y);
    }
  }

  setZoom(zoom) {
    if (this.renderer.setZoom) {
      this.renderer.setZoom(zoom);
    }
  }

  setPan(x, y) {
    if (this.renderer.setPan) {
      this.renderer.setPan(x, y);
    }
  }

  destroy() {
    if (this.renderer.destroy) {
      this.renderer.destroy();
    }
  }
}

// Base Renderer Interface
class BaseRenderer {
  constructor(container) {
    this.container = container;
    this.faces = ["U", "L", "F", "R", "B", "D"];
  }

  render(cubeState, stickerRotations, stickerTextures, textureConfig) {
    throw new Error('render() must be implemented by subclass');
  }

  applyStickerStyle(sticker, face, index, stickerId, stickerRotations, textureConfig) {
    sticker.style.background = "";
    sticker.style.backgroundImage = "";
    sticker.style.backgroundSize = "";
    sticker.style.backgroundPosition = "";
    sticker.style.backgroundRepeat = "";

    const { textureMode, faceTextures, customStickers, stickerTextures, textureLibrary, cubeAssignments } = textureConfig;

    if (textureMode === "layered") {
      this.applyLayeredTexture(sticker, face, index, stickerId, stickerTextures, faceTextures, customStickers);
    } else if (textureMode === "face_textures") {
      this.applyFaceTexture(sticker, face, index, faceTextures);
    } else if (textureMode === "custom_indices") {
      this.applyCustomTexture(sticker, stickerId, customStickers);
    } else if (textureMode === "unified") {
      this.applyUnifiedTexture(sticker, face, index, stickerId, stickerTextures, textureLibrary, cubeAssignments);
    } else {
      sticker.style.backgroundColor = "#888888";
    }

    sticker.innerHTML = "";
    const rotation = stickerRotations[face][index] * 90;
    sticker.style.transform = rotation ? `rotate(${rotation}deg)` : "";
  }

  applyLayeredTexture(sticker, face, index, stickerId, stickerTextures, faceTextures, customStickers) {
    const backgroundImages = [];
    const backgroundSizes = [];
    const backgroundPositions = [];
    const backgroundRepeats = [];

    const customStyle = customStickers[stickerId];
    if (customStyle && customStyle.background) {
      backgroundImages.push(customStyle.background);
      backgroundSizes.push(customStyle.backgroundSize || 'auto');
      backgroundPositions.push(customStyle.backgroundPosition || 'center');
      backgroundRepeats.push(customStyle.backgroundRepeat || 'no-repeat');
    }

    if (stickerTextures[face] && stickerTextures[face][index]) {
      const textureInfo = stickerTextures[face][index];
      const originalFace = textureInfo.face;
      const originalIndex = textureInfo.index;
      const texture = faceTextures[originalFace];
      const centerTexture = faceTextures[originalFace + "_center"];

      if (originalIndex === 4 && centerTexture) {
        if (centerTexture.background) {
          sticker.style.background = centerTexture.background;
          if (centerTexture.backgroundSize) sticker.style.backgroundSize = centerTexture.backgroundSize;
          if (centerTexture.backgroundPosition) sticker.style.backgroundPosition = centerTexture.backgroundPosition;
          if (centerTexture.backgroundRepeat) sticker.style.backgroundRepeat = centerTexture.backgroundRepeat;
        }
      } else if (texture) {
        if (texture.backgroundImage) {
          const row = Math.floor(originalIndex / 3);
          const col = originalIndex % 3;
          backgroundImages.push(texture.backgroundImage);
          backgroundSizes.push(texture.backgroundSize || '300% 300%');
          backgroundPositions.push(`${col * 50}% ${row * 50}%`);
          backgroundRepeats.push(texture.backgroundRepeat || 'no-repeat');
        } else if (texture.background) {
          sticker.style.background = texture.background;
          if (texture.backgroundSize) sticker.style.backgroundSize = texture.backgroundSize;
          if (texture.backgroundPosition) sticker.style.backgroundPosition = texture.backgroundPosition;
          if (texture.backgroundRepeat) sticker.style.backgroundRepeat = texture.backgroundRepeat;
        }
      }
    }

    if (backgroundImages.length > 0) {
      sticker.style.backgroundImage = backgroundImages.join(', ');
      sticker.style.backgroundSize = backgroundSizes.join(', ');
      sticker.style.backgroundPosition = backgroundPositions.join(', ');
      sticker.style.backgroundRepeat = backgroundRepeats.join(', ');
    }
  }

  applyFaceTexture(sticker, face, index, faceTextures) {
    const texture = faceTextures[face];
    const centerTexture = faceTextures[face + "_center"];

    if (index === 4 && centerTexture) {
      Object.assign(sticker.style, centerTexture);
    } else if (texture) {
      if (texture.backgroundImage) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        sticker.style.backgroundImage = texture.backgroundImage;
        sticker.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        sticker.style.backgroundSize = texture.backgroundSize || "300% 300%";
        sticker.style.backgroundRepeat = "no-repeat";
      } else {
        Object.assign(sticker.style, texture);
      }
    }
  }

  applyCustomTexture(sticker, stickerId, customStickers) {
    const style = customStickers[stickerId];
    if (style) Object.assign(sticker.style, style);
  }

  applyUnifiedTexture(sticker, face, index, stickerId, stickerTextures, textureLibrary, cubeAssignments) {
    const originalFace = this.faces[Math.floor(stickerId / 9)];
    const originalIndex = stickerId % 9;
    const originalKey = originalFace + originalIndex;

    const stickerAssignment = cubeAssignments[originalKey];
    const faceAssignment = cubeAssignments[originalFace];

    if (Array.isArray(stickerAssignment)) {
      const layers = [];
      const sizes = [];
      const positions = [];
      const repeats = [];

      let baseTexture, overlayTexture;

      if (stickerAssignment.length === 1) {
        overlayTexture = stickerAssignment[0];
        if (faceAssignment) baseTexture = faceAssignment;
      } else if (stickerAssignment.length >= 2) {
        baseTexture = stickerAssignment[0];
        overlayTexture = stickerAssignment[1];
      }

      if (overlayTexture) {
        const overlay = this.resolveTexture(overlayTexture, textureLibrary);
        if (overlay) {
          if (typeof overlay === 'string') {
            layers.push(overlay);
            sizes.push('auto');
            positions.push('center');
            repeats.push('no-repeat');
          } else if (overlay && typeof overlay === 'object') {
            if (overlay.background) {
              layers.push(overlay.background);
            } else if (overlay.backgroundImage) {
              layers.push(overlay.backgroundImage);
            }
            sizes.push(overlay.backgroundSize || 'auto');
            positions.push(overlay.backgroundPosition || 'center');
            repeats.push(overlay.backgroundRepeat || 'no-repeat');
          }
        }
      }

      if (baseTexture) {
        const base = this.resolveTexture(baseTexture, textureLibrary);
        if (base) {
          if (typeof base === 'string') {
            if (base.startsWith('#') || base.startsWith('rgb') || (!base.includes('(') && !base.includes('url'))) {
              layers.push(`linear-gradient(${base}, ${base})`);
            } else {
              layers.push(base);
            }
            sizes.push('auto');
            positions.push('center');
            repeats.push('no-repeat');
          } else if (base && typeof base === 'object') {
            if (base.backgroundImage) {
              const row = Math.floor(originalIndex / 3);
              const col = originalIndex % 3;
              layers.push(base.backgroundImage);
              sizes.push(base.backgroundSize || '300% 300%');
              positions.push(`${col * 50}% ${row * 50}%`);
              repeats.push('no-repeat');
            } else if (base.background) {
              layers.push(base.background);
              sizes.push(base.backgroundSize || 'auto');
              positions.push(base.backgroundPosition || 'center');
              repeats.push(base.backgroundRepeat || 'no-repeat');
            }
          }
        }
      }

      if (layers.length > 0) {
        sticker.style.backgroundImage = layers.join(', ');
        sticker.style.backgroundSize = sizes.join(', ');
        sticker.style.backgroundPosition = positions.join(', ');
        sticker.style.backgroundRepeat = repeats.join(', ');
      }
    } else if (stickerAssignment) {
      const texture = this.resolveTexture(stickerAssignment, textureLibrary);
      if (texture) this.applyTextureToElement(sticker, texture, originalFace, originalIndex, false);
    } else if (faceAssignment) {
      const texture = this.resolveTexture(faceAssignment, textureLibrary);
      const isSprite = texture && typeof texture === 'object' && texture.backgroundImage;
      if (texture) this.applyTextureToElement(sticker, texture, originalFace, originalIndex, isSprite);
    }
  }

  resolveTexture(textureName, textureLibrary) {
    if (typeof textureName === 'string') {
      if (textureName.startsWith('textures.')) {
        const name = textureName.slice(9);
        return textureLibrary[name] || null;
      }
      if (textureName.startsWith('$')) {
        return textureName;
      }
      if (textureName.startsWith('#') || textureName.startsWith('rgb') ||
        textureName.includes('gradient') || textureName.includes('url(')) {
        return textureName;
      }
      return null;
    }
    return textureLibrary[textureName] || textureName;
  }

  applyTextureToElement(sticker, texture, face, index, isSprite) {
    if (typeof texture === 'string') {
      sticker.style.background = texture;
    } else if (texture && typeof texture === 'object' && !Array.isArray(texture)) {
      if (texture.backgroundImage && isSprite) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        sticker.style.backgroundImage = texture.backgroundImage;
        sticker.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        sticker.style.backgroundSize = texture.backgroundSize || "300% 300%";
        sticker.style.backgroundRepeat = "no-repeat";
      } else if (texture.backgroundImage) {
        sticker.style.backgroundImage = texture.backgroundImage;
        if (texture.backgroundSize) sticker.style.backgroundSize = texture.backgroundSize;
        if (texture.backgroundPosition) sticker.style.backgroundPosition = texture.backgroundPosition;
        if (texture.backgroundRepeat) sticker.style.backgroundRepeat = texture.backgroundRepeat;
      } else {
        for (const [key, value] of Object.entries(texture)) {
          sticker.style[key] = value;
        }
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CubeView, BaseRenderer };
}
