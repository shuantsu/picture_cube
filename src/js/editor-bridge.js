// Editor Bridge - Manages editor integration
export class EditorBridge {
  constructor(domManager, viewController) {
    this.dom = domManager;
    this.viewController = viewController;
    this.editorOpen = false;
  }

  init() {
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  toggleEditor() {
    const editorIframe = this.dom.get('editor-iframe');
    const panel = this.dom.get('right-panel');
    
    this.editorOpen = !this.editorOpen;
    
    if (this.editorOpen) {
      this.viewController.setViewMode('perspective');
      if (window.toggleEditorWindow) window.toggleEditorWindow(true);

      editorIframe.style.display = 'block';
      panel.classList.add('editor-open');
      
      setTimeout(() => {
        try {
          editorIframe.contentWindow.triggerImportFromParent();
        } catch (e) {}
      }, 200);

      this.sendConfigToEditor();
      this.dom.get('cubenetBtn').disabled = true;
    } else {
      this.dom.get('cubenetBtn').disabled = false;
      editorIframe.style.display = 'none';
      panel.classList.remove('editor-open');
      if (window.toggleEditorWindow) window.toggleEditorWindow(false);
    }
  }

  sendConfigToEditor() {
    const currentConfig = this.dom.get('customConfig').value;
    if (!currentConfig?.trim()) return;

    const editorIframe = this.dom.get('editor-iframe');
    const sendConfig = () => {
      try {
        const config = JSON.parse(currentConfig);
        editorIframe.contentWindow.postMessage({
          type: 'IMPORT_CONFIG',
          payload: { config }
        }, '*');
      } catch (e) {
        editorIframe.contentWindow.postMessage({
          type: 'IMPORT_CONFIG',
          payload: { config: currentConfig }
        }, '*');
      }
    };

    setTimeout(sendConfig, 500);
    editorIframe.onload = sendConfig;
  }

  handleMessage(event) {
    if (!event.data?.type) return;

    switch (event.data.type) {
      case 'UPDATE_CONFIG':
        if (event.data.payload.config) {
          const config = event.data.payload.config;
          this.dom.get('customConfig').value = JSON.stringify(config, null, 2);
          if (window.loadCustomConfig) window.loadCustomConfig();
        }
        break;

      case 'CLOSE_EDITOR':
        this.toggleEditor();
        break;

      case 'EDITOR_READY':
        const currentConfig = this.dom.get('customConfig').value;
        if (currentConfig?.trim()) {
          try {
            const config = JSON.parse(currentConfig);
            event.source.postMessage({
              type: 'IMPORT_CONFIG',
              payload: { config }
            }, '*');
          } catch (e) {
            event.source.postMessage({
              type: 'IMPORT_CONFIG',
              payload: { config: currentConfig }
            }, '*');
          }
        }
        break;

      case 'MODAL_OPENED':
        if (this.editorOpen) {
          $('#cube-3d-window').fadeOut();
        }
        break;

      case 'MODAL_CLOSED':
        if (this.editorOpen) {
          $('#cube-3d-window').fadeIn();
        }
        break;
    }
  }
}
