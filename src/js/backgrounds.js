const DEFAULT_BG_COLOR = '#3724a3'; // Single source of truth (must be 6-digit hex for color picker)

let defaultTexture = null;
let examples = {};
const examplesRaw = {};

// Promise that resolves when examples INDEX is loaded (not the files themselves)
const examplesLoadedPromise = fetch('examples/index.json')
  .then(r => r.json())
  .then(files => {
    const select = document.getElementById('exampleSelect');
    // Only populate dropdown, don't fetch files yet
    files.forEach(filename => {
      const name = filename.replace('.json', '').replace(/^\d+-/, '');
      const option = document.createElement('option');
      option.value = filename;
      option.textContent = name;
      select.appendChild(option);
    });
    window.dispatchEvent(new CustomEvent('examplesLoaded'));
  });

  // Fetch individual example file on-demand
  async function fetchExample(filename) {
    if (examplesRaw[filename]) {
      return examplesRaw[filename]; // Already cached
    }
    const response = await fetch(`examples/${filename}`);
    const text = await response.text();
    examplesRaw[filename] = text;
    return text;
  }
  window.fetchExample = fetchExample;

  function stripJsonComments(json) {
    let result = '', inString = false, inComment = false, inBlockComment = false;
    for (let i = 0; i < json.length; i++) {
      const char = json[i], next = json[i + 1] || '';
      if (inBlockComment) {
        if (char === '*' && next === '/') { inBlockComment = false; i++; }
        continue;
      }
      if (inComment) {
        if (char === '\n') { inComment = false; result += char; }
        continue;
      }
      if (char === '"' && (i === 0 || json[i - 1] !== '\\')) {
        inString = !inString;
        result += char;
        continue;
      }
      if (!inString) {
        if (char === '/' && next === '/') { inComment = true; i++; continue; }
        if (char === '/' && next === '*') { inBlockComment = true; i++; continue; }
      }
      result += char;
    }
    return result;
  }
window.stripJsonComments = stripJsonComments;
window.examplesRaw = examplesRaw;
window.examplesLoadedPromise = examplesLoadedPromise;

  let backgroundsLoaded = false;
  let backgroundFiles = [];
  let savedBgFile = null;
  const thumbnailObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.loaded) {
        const file = entry.target.dataset.bg;
        entry.target.style.backgroundImage = `url('backgrounds/thumbnails/${file.replace(/\.[^.]+$/, '.jpg')}')`;
        entry.target.dataset.loaded = 'true';
      }
    });
  });
  
  function loadBackgroundThumbnails() {
    if (backgroundsLoaded) return;
    backgroundsLoaded = true;
    
    const gallery = document.getElementById('backgroundGallery');
    backgroundFiles.forEach(file => {
      const thumb = document.createElement('div');
      thumb.className = 'bg-thumb';
      thumb.dataset.bg = file;
      thumb.onclick = () => selectBackground(file);
      gallery.appendChild(thumb);
      thumbnailObserver.observe(thumb);
    });
    
    // Mark saved background as selected if it exists
    if (savedBgFile) {
      const thumb = document.querySelector(`[data-bg="${savedBgFile}"]`);
      if (thumb) thumb.classList.add('selected');
    }
  }
  
  // Fetch index
  fetch('backgrounds/index.json')
    .then(r => r.json())
    .then(files => {
      backgroundFiles = files;
      
      const checkAccordion = () => {
        const bgAccordion = document.querySelector('.accordion:has(#backgroundGallery)');
        const header = bgAccordion?.querySelector('.accordion-header');
        
        header?.addEventListener('click', loadBackgroundThumbnails, { once: true });
        
        // Check immediately if already open
        if (bgAccordion?.classList.contains('open')) {
          loadBackgroundThumbnails();
        }
        
        window.addEventListener('accordionStatesLoaded', () => {
          if (bgAccordion?.classList.contains('open')) {
            loadBackgroundThumbnails();
          }
        }, { once: true });
      };
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAccordion);
      } else {
        checkAccordion();
      }
    });

  let currentBackgroundFile = null;
  
  function selectBackground(file) {
    const panel = document.getElementById('right-panel');
    if (!file) {
      currentBackgroundFile = null;
      panel.style.backgroundImage = '';
      localStorage.setItem('selectedBackground', '');
      localStorage.removeItem('backgroundColor');
      document.querySelectorAll('.bg-thumb').forEach(t => t.classList.remove('selected'));
      document.querySelector('.bg-thumb.none').classList.add('selected');
      return;
    }
    
    // Track current selection to prevent race condition
    currentBackgroundFile = file;
    
    // Show thumbnail immediately
    const thumbnailUrl = `backgrounds/thumbnails/${file.replace(/\.[^.]+$/, '.jpg')}`;
    panel.style.backgroundImage = `url('${thumbnailUrl}')`;
    
    // Load full image
    const img = new Image();
    img.onload = () => {
      // Only apply if this is still the selected background
      if (currentBackgroundFile === file) {
        panel.style.backgroundImage = `url('backgrounds/${file}')`;
      }
    };
    img.src = `backgrounds/${file}`;
    
    localStorage.setItem('selectedBackground', file);
    localStorage.removeItem('backgroundColor');
    document.querySelectorAll('.bg-thumb').forEach(t => t.classList.remove('selected'));
    const thumb = document.querySelector(`[data-bg="${file}"]`);
    if (thumb) thumb.classList.add('selected');
  }

  function applyBackgroundColor() {
    const color = document.getElementById('bgColorPicker').value;
    const panel = document.getElementById('right-panel');
    panel.style.backgroundImage = '';
    panel.style.backgroundColor = color;
    localStorage.setItem('backgroundColor', color);
    localStorage.removeItem('selectedBackground');
    document.querySelectorAll('.bg-thumb').forEach(t => t.classList.remove('selected'));
  }
window.applyBackgroundColor = applyBackgroundColor;

export { examplesRaw };

// Load saved background/color after DOM is ready
let hasLoadedBackground = false;
function loadSavedBackgroundOnce() {
  if (hasLoadedBackground) return;
  hasLoadedBackground = true;
  loadSavedBackground();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSavedBackgroundOnce);
} else {
  loadSavedBackgroundOnce();
}

function loadSavedBackground() {
  const savedBg = localStorage.getItem('selectedBackground');
  const savedColor = localStorage.getItem('backgroundColor');
  const picker = document.getElementById('bgColorPicker');
  const panel = document.getElementById('right-panel');
  
  if (savedColor) {
    if (panel) panel.style.backgroundColor = savedColor;
    if (picker) picker.value = savedColor;
  } else {
    if (picker) picker.value = DEFAULT_BG_COLOR;
    if (panel) panel.style.backgroundColor = DEFAULT_BG_COLOR;
  }
  
  if (savedBg) {
    savedBgFile = savedBg;
    selectBackground(savedBg);
  } else {
    document.querySelector('.bg-thumb.none')?.classList.add('selected');
  }
}

window.DEFAULT_BG_COLOR = DEFAULT_BG_COLOR;
  