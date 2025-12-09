
  let defaultTexture = null;
  let examples = {};
  let examplesRaw = {};

  // Load examples list and preload files
  fetch('examples/index.json')
    .then(r => r.json())
    .then(files => {
      const select = document.getElementById('exampleSelect');
      return Promise.all(files.map(filename => 
        fetch(`examples/${filename}`)
          .then(r => r.text())
          .then(text => {
            examplesRaw[filename] = text;
            const name = filename.replace('.json', '').replace(/^\d+-/, '');
            const option = document.createElement('option');
            option.value = filename;
            option.textContent = name;
            if (filename === '05-pochman_supercube.json') {
              option.selected = true;
              defaultTexture = JSON.parse(stripJsonComments(text));
            }
            select.appendChild(option);
          })
      ));
    })
    .then(() => {});

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

  // Load backgrounds
  fetch('backgrounds/index.json')
    .then(r => r.json())
    .then(files => {
      const gallery = document.getElementById('backgroundGallery');
      files.forEach(file => {
        const thumb = document.createElement('div');
        thumb.className = 'bg-thumb';
        thumb.dataset.bg = file;
        thumb.style.backgroundImage = `url('backgrounds/thumbnails/${file.replace(/\.[^.]+$/, '.jpg')}')`;
        thumb.onclick = () => selectBackground(file);
        gallery.appendChild(thumb);
      });
    });

  function selectBackground(file) {
    const panel = document.getElementById('right-panel');
    if (!file) {
      panel.style.backgroundImage = '';
      localStorage.setItem('selectedBackground', '');
      document.querySelectorAll('.bg-thumb').forEach(t => t.classList.remove('selected'));
      document.querySelector('.bg-thumb.none').classList.add('selected');
      return;
    }
    panel.style.backgroundImage = `url('backgrounds/${file}')`;
    localStorage.setItem('selectedBackground', file);
    document.querySelectorAll('.bg-thumb').forEach(t => t.classList.remove('selected'));
    const thumb = document.querySelector(`[data-bg="${file}"]`);
    if (thumb) thumb.classList.add('selected');
  }

  const savedBg = localStorage.getItem('selectedBackground');
  if (savedBg) selectBackground(savedBg);
  else document.querySelector('.bg-thumb.none').classList.add('selected');
  