// TextureManager - Handles all texture-related operations
export default class TextureManager {
  constructor() {
    this.textureMode = "standard";
    this.faceTextures = {};
    this.customStickers = {};
    this.textureLibrary = {};
    this.cubeAssignments = {};
  }

  setMode(mode) {
    this.textureMode = mode;
  }

  getConfig() {
    return {
      textureMode: this.textureMode,
      faceTextures: this.faceTextures,
      customStickers: this.customStickers,
      textureLibrary: this.textureLibrary,
      cubeAssignments: this.cubeAssignments
    };
  }

  loadUnifiedConfig(config) {
    this.textureLibrary = config.textures || {};
    this.cubeAssignments = config.cube || {};
  }

  loadLegacyConfig(config) {
    if (config.mode === "face_textures") {
      this.textureMode = "face_textures";
      this.faceTextures = config.textures || {};
    } else if (config.mode === "custom_indices") {
      this.textureMode = "custom_indices";
      this.customStickers = config.stickers || {};
    } else if (config.mode === "layered") {
      this.textureMode = "layered";
      this.faceTextures = config.textures || {};
      this.customStickers = config.stickers || {};
    }
  }

  applyStickerStyle(sticker, face, index, stickerId, stickerRotations, stickerTextures, cubeState, faces) {
    sticker.style.background = "";
    sticker.style.backgroundImage = "";
    sticker.style.backgroundSize = "";
    sticker.style.backgroundPosition = "";
    sticker.style.backgroundRepeat = "";

    if (this.textureMode === "layered") {
      this._applyLayeredMode(sticker, face, index, stickerId, stickerTextures);
    } else if (this.textureMode === "face_textures") {
      this._applyFaceTexturesMode(sticker, face, index);
    } else if (this.textureMode === "custom_indices") {
      this._applyCustomIndicesMode(sticker, stickerId);
    } else if (this.textureMode === "unified") {
      this._applyUnifiedTexture(sticker, face, index, cubeState, faces);
    } else {
      sticker.style.backgroundColor = "#888888";
    }

    sticker.innerHTML = "";
    const rotation = stickerRotations[face][index] * 90;
    sticker.style.transform = rotation ? `rotate(${rotation}deg)` : "";
  }

  _applyLayeredMode(sticker, face, index, stickerId, stickerTextures) {
    const backgroundImages = [];
    const backgroundSizes = [];
    const backgroundPositions = [];
    const backgroundRepeats = [];
    
    const customStyle = this.customStickers[stickerId];
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
      const texture = this.faceTextures[originalFace];
      const centerTexture = this.faceTextures[originalFace + "_center"];

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

  _applyFaceTexturesMode(sticker, face, index) {
    const texture = this.faceTextures[face];
    const centerTexture = this.faceTextures[face + "_center"];

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

  _applyCustomIndicesMode(sticker, stickerId) {
    const style = this.customStickers[stickerId];
    if (style) Object.assign(sticker.style, style);
  }

  _applyUnifiedTexture(sticker, face, index, cubeState, faces) {
    const stickerId = cubeState[face][index];
    const originalFace = faces[Math.floor(stickerId / 9)];
    const originalIndex = stickerId % 9;
    const originalKey = originalFace + originalIndex;
    
    const stickerAssignment = this.cubeAssignments[originalKey];
    const faceAssignment = this.cubeAssignments[originalFace];
    
    if (Array.isArray(stickerAssignment)) {
      this._applyArrayAssignment(sticker, stickerAssignment, faceAssignment, originalIndex);
    } else if (stickerAssignment) {
      const texture = this._resolveTexture(stickerAssignment);
      if (texture) this._applyTextureToElement(sticker, texture, originalFace, originalIndex, false);
    } else if (faceAssignment) {
      const texture = this._resolveTexture(faceAssignment);
      const isSprite = texture && typeof texture === 'object' && texture.backgroundImage;
      if (texture) this._applyTextureToElement(sticker, texture, originalFace, originalIndex, isSprite);
    }
  }

  _applyArrayAssignment(sticker, stickerAssignment, faceAssignment, originalIndex) {
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
      const overlay = this._resolveTexture(overlayTexture);
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
      const base = this._resolveTexture(baseTexture);
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
  }

  _resolveTexture(textureName) {
    if (typeof textureName === 'string') {
      if (textureName.startsWith('textures.')) {
        const name = textureName.slice(9);
        return this.textureLibrary[name] || null;
      }
      if (textureName.startsWith('$')) {
        return textureName;
      }
      if (textureName.startsWith('#') || textureName.startsWith('rgb') || 
          textureName.includes('gradient') || textureName.includes('url(')) {
        return textureName;
      }
      console.warn(`Invalid texture reference: "${textureName}". Use "textures.name", "$var", or inline value.`);
      return null;
    }
    return this.textureLibrary[textureName] || textureName;
  }

  _applyTextureToElement(sticker, texture, face, index, isSprite) {
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
