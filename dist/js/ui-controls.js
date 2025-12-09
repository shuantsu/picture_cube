// UI Controls Manager
class UIControls {
  constructor() {
    this.defaultPanelWidth = 350;
    this.uiScale = 100;
    this.textScale = 100;
    this.panelWidth = this.defaultPanelWidth;
    this.bgWidth = 100;
    this.bgHeight = 100;
  }

  initAccessibility() {
    $('#uiScale').addEventListener('input', (e) => {
      this.uiScale = parseInt(e.target.value);
      $('#uiScaleValue').textContent = this.uiScale;
      this.applyAccessibility();
    });

    $('#textScale').addEventListener('input', (e) => {
      this.textScale = parseInt(e.target.value);
      $('#textScaleValue').textContent = this.textScale;
      this.applyAccessibility();
    });

    $('#panelWidth').addEventListener('input', (e) => {
      this.panelWidth = parseInt(e.target.value);
      $('#panelWidthValue').textContent = this.panelWidth;
      this.applyAccessibility();
    });
  }

  applyAccessibility() {
    document.documentElement.style.setProperty('--ui-scale', this.uiScale / 100);
    document.documentElement.style.setProperty('--text-scale', this.textScale / 100);
    $('#controls').style.width = this.panelWidth + 'px';
    localStorage.setItem('uiScale', this.uiScale);
    localStorage.setItem('textScale', this.textScale);
    localStorage.setItem('panelWidth', this.panelWidth);
  }

  resetAccessibility() {
    this.uiScale = 100;
    this.textScale = 100;
    this.panelWidth = this.defaultPanelWidth;
    $('#uiScale').value = 100;
    $('#textScale').value = 100;
    $('#panelWidth').value = this.defaultPanelWidth;
    $('#uiScaleValue').textContent = 100;
    $('#textScaleValue').textContent = 100;
    $('#panelWidthValue').textContent = this.defaultPanelWidth;
    this.applyAccessibility();
  }

  loadAccessibility() {
    try {
      const savedUi = localStorage.getItem('uiScale');
      const savedText = localStorage.getItem('textScale');
      const savedPanel = localStorage.getItem('panelWidth');
      if (savedUi) {
        this.uiScale = parseInt(savedUi);
        $('#uiScale').value = this.uiScale;
        $('#uiScaleValue').textContent = this.uiScale;
      }
      if (savedText) {
        this.textScale = parseInt(savedText);
        $('#textScale').value = this.textScale;
        $('#textScaleValue').textContent = this.textScale;
      }
      if (savedPanel) {
        this.panelWidth = parseInt(savedPanel);
        $('#panelWidth').value = this.panelWidth;
        $('#panelWidthValue').textContent = this.panelWidth;
      }
      this.applyAccessibility();
    } catch (e) {}
  }

  initBackground() {
    $('#bgWidth').addEventListener('input', (e) => {
      this.bgWidth = parseInt(e.target.value);
      $('#bgWidthValue').textContent = this.bgWidth;
      this.applyBackgroundSize();
    });

    $('#bgHeight').addEventListener('input', (e) => {
      this.bgHeight = parseInt(e.target.value);
      $('#bgHeightValue').textContent = this.bgHeight;
      this.applyBackgroundSize();
    });

    window.addEventListener('resize', () => this.applyBackgroundSize());
  }

  applyBackgroundSize() {
    const panel = $('#right-panel');
    const rect = panel.getBoundingClientRect();
    const width = (rect.width * this.bgWidth) / 100;
    const height = (rect.height * this.bgHeight) / 100;
    panel.style.backgroundSize = `${width}px ${height}px`;
    localStorage.setItem('bgWidth', this.bgWidth);
    localStorage.setItem('bgHeight', this.bgHeight);
  }

  resetBackgroundSize() {
    this.bgWidth = 100;
    this.bgHeight = 100;
    $('#bgWidth').value = 100;
    $('#bgHeight').value = 100;
    $('#bgWidthValue').textContent = 100;
    $('#bgHeightValue').textContent = 100;
    this.applyBackgroundSize();
  }

  loadBackground() {
    try {
      const savedWidth = localStorage.getItem('bgWidth');
      const savedHeight = localStorage.getItem('bgHeight');
      if (savedWidth) {
        this.bgWidth = parseInt(savedWidth);
        $('#bgWidth').value = this.bgWidth;
        $('#bgWidthValue').textContent = this.bgWidth;
      }
      if (savedHeight) {
        this.bgHeight = parseInt(savedHeight);
        $('#bgHeight').value = this.bgHeight;
        $('#bgHeightValue').textContent = this.bgHeight;
      }
      this.applyBackgroundSize();
    } catch (e) {}
  }

  selectBackground(filename) {
    const panel = $('#right-panel');
    if (filename) {
      panel.style.backgroundImage = `url('backgrounds/${filename}')`;
      localStorage.setItem('selectedBackground', filename);
    } else {
      panel.style.backgroundImage = '';
      localStorage.removeItem('selectedBackground');
    }
    
    document.querySelectorAll('.bg-thumb').forEach(t => t.style.border = '2px solid transparent');
    const thumb = document.querySelector(`[data-bg="${filename}"]`);
    if (thumb) thumb.style.border = '2px solid #4caf50';
  }

  loadSelectedBackground() {
    try {
      const saved = localStorage.getItem('selectedBackground');
      if (saved) this.selectBackground(saved);
    } catch (e) {}
  }

  toggleSidebar() {
    const controls = $('#controls');
    const container = $('#container');
    controls.classList.toggle('open');
    container.classList.toggle('controls-open');
    this.saveSidebarState();
  }

  saveSidebarState() {
    const controls = $('#controls');
    localStorage.setItem('sidebarOpen', controls.classList.contains('open'));
  }

  loadSidebarState() {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved === 'true') {
        $('#controls').classList.add('open');
        $('#container').classList.add('controls-open');
      }
    } catch (e) {}
  }

  toggleAccordion(header) {
    const accordion = header.parentElement;
    accordion.classList.toggle('open');
    this.saveAccordionStates();
  }

  saveAccordionStates() {
    const accordions = document.querySelectorAll('.accordion');
    const states = {};
    accordions.forEach((accordion, index) => {
      states[index] = accordion.classList.contains('open');
    });
    localStorage.setItem('accordionStates', JSON.stringify(states));
  }

  loadAccordionStates() {
    try {
      const saved = localStorage.getItem('accordionStates');
      if (saved) {
        const states = JSON.parse(saved);
        const accordions = document.querySelectorAll('.accordion');
        accordions.forEach((accordion, index) => {
          if (states[index]) {
            accordion.classList.add('open');
          } else {
            accordion.classList.remove('open');
          }
        });
      }
    } catch (e) {}
  }

  showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
}
