// Config Loader - Handles texture configuration loading
export class ConfigLoader {
  constructor(domManager, textureManager, updateCallback) {
    this.dom = domManager;
    this.textureManager = textureManager;
    this.updateCallback = updateCallback;
    this.faces = ['U', 'L', 'F', 'R', 'B', 'D'];
  }

  loadCustomConfig() {
    const spinner = this.dom.get('loadingSpinner');
    spinner.style.display = 'block';
    
    // Show grey stickers while loading
    this.faces.forEach(face => {
      ['.face-2d', '.face-3d'].forEach(selector => {
        const faceEl = document.querySelector(`${selector}[data-face="${face}"]`);
        if (faceEl) {
          Array.from(faceEl.children).forEach(sticker => {
            sticker.style.background = '#999';
          });
        }
      });
    });
    
    try {
      let configText = this.dom.get('customConfig').value;
      if (!configText?.trim()) {
        spinner.style.display = 'none';
        return;
      }

      configText = this.stripJsonComments(configText);
      let finalConfig = JSON.parse(configText);
      
      // Handle unified system
      if (finalConfig.textures && finalConfig.cube && !finalConfig.mode) {
        this.textureManager.setMode('unified');
        if (finalConfig.vars) {
          finalConfig = this.replaceVarsInConfig(finalConfig);
        }
        this.textureManager.loadUnifiedConfig(finalConfig);
      }
      // Legacy system
      else if (finalConfig.mode) {
        if (finalConfig.vars) {
          finalConfig = this.replaceVarsInConfig(finalConfig);
        }
        this.textureManager.loadLegacyConfig(finalConfig);
      }

      this.waitForImages().then(() => {
        this.updateCallback();
        spinner.style.display = 'none';
      });
    } catch (error) {
      spinner.style.display = 'none';
      alert('JSON Error: ' + error.message);
    }
  }

  async loadExample() {
    const select = this.dom.get('exampleSelect');
    const filename = select.value;
    if (!filename) return;
    
    const spinner = this.dom.get('loadingSpinner');
    spinner.style.display = 'block';
    
    // Show grey stickers while loading
    this.faces.forEach(face => {
      ['.face-2d', '.face-3d'].forEach(selector => {
        const faceEl = document.querySelector(`${selector}[data-face="${face}"]`);
        if (faceEl) {
          Array.from(faceEl.children).forEach(sticker => {
            sticker.style.background = '#999';
          });
        }
      });
    });
    
    // Fetch example on-demand
    const rawContent = await window.fetchExample(filename);
    if (rawContent) {
      this.dom.get('customConfig').value = rawContent;
      this.loadCustomConfig();
      this.saveSelectedTexture(filename);
    }

    // Only trigger import if editor is actually open
    if (window.editorOpen) {
      this.dom.get('editor-iframe')?.contentWindow?.triggerImportFromParent();
    }
  }

  async loadDefaultTexture() {
    const savedTexture = localStorage.getItem('selectedTexture');
    const select = this.dom.get('exampleSelect');
    
    // Wait for examples INDEX to be loaded (not the files)
    await window.examplesLoadedPromise;
    
    if (savedTexture) {
      select.value = savedTexture;
      await this.loadExample(); // Fetch only this one
    } else {
      const firstOption = select.options[1];
      if (firstOption) {
        select.value = firstOption.value;
        await this.loadExample(); // Fetch only this one
      }
    }
  }

  saveSelectedTexture(filename) {
    localStorage.setItem('selectedTexture', filename);
  }

  stripJsonComments(json) {
    let result = '';
    let inString = false;
    let inComment = false;
    let inBlockComment = false;

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      const next = json[i + 1] || '';

      if (inBlockComment) {
        if (char === '*' && next === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }

      if (inComment) {
        if (char === '\n') {
          inComment = false;
          result += char;
        }
        continue;
      }

      if (char === '"' && (i === 0 || json[i - 1] !== '\\')) {
        inString = !inString;
        result += char;
        continue;
      }

      if (!inString) {
        if (char === '/' && next === '/') {
          inComment = true;
          i++;
          continue;
        }
        if (char === '/' && next === '*') {
          inBlockComment = true;
          i++;
          continue;
        }
      }

      result += char;
    }
    return result;
  }

  replaceVarsInConfig(config) {
    const replaceVars = (obj) => {
      if (typeof obj === 'string') {
        return obj.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
          return config.vars[varName] !== undefined ? config.vars[varName] : match;
        });
      } else if (Array.isArray(obj)) {
        return obj.map(replaceVars);
      } else if (obj && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key !== 'vars') {
            result[key] = replaceVars(value);
          }
        }
        return result;
      }
      return obj;
    };
    return replaceVars(config);
  }

  waitForImages() {
    const imagePromises = [];
    Object.values(this.textureManager.faceTextures).forEach(texture => {
      if (texture?.backgroundImage) {
        const match = texture.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (match) {
          const img = new Image();
          const promise = new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          img.src = match[1];
          imagePromises.push(promise);
        }
      }
    });
    return Promise.all(imagePromises);
  }
}
