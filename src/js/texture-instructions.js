import { marked } from 'marked';

function loadInstructions() {
  fetch('texture-instructions.md')
    .then(r => r.text())
    .then(md => {
      const el = document.getElementById('instructionsContent');
      if (el) el.innerHTML = marked.parse(md);
    })
    .catch(() => {
      const el = document.getElementById('instructionsContent');
      if (el) el.innerHTML = '<p>Instructions file not found.</p>';
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadInstructions);
} else {
  loadInstructions();
}