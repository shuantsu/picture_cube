// Modal Manager - Handles all modal dialogs
export class ModalManager {
  constructor(domManager, getCubeState, getStickerRotations) {
    this.dom = domManager;
    this.getCubeState = getCubeState;
    this.getStickerRotations = getStickerRotations;
    this.faces = ['U', 'L', 'F', 'R', 'B', 'D'];
  }

  openStateModal() {
    this.updateStateTab();
    this.updateRotationsTab();
    
    const modal = this.dom.$('#stateModal');
    const content = modal.querySelector('.modal-content');
    const longestLineChars = 41;
    const charWidth = 8.4;
    const padding = 60;
    const optimalWidth = Math.min(longestLineChars * charWidth + padding, window.innerWidth * 0.9);
    
    content.style.width = `${optimalWidth}px`;
    modal.style.display = 'block';
  }

  closeStateModal() {
    this.dom.$('#stateModal').style.display = 'none';
  }

  openInstructionsModal() {
    this.dom.$('#instructionsModal').style.display = 'block';
    
    document.querySelectorAll('a[href="#try-example"]').forEach(link => {
      link.onclick = () => {
        let nextElement = link.parentElement.nextElementSibling;
        while (nextElement && nextElement.tagName !== 'PRE') {
          nextElement = nextElement.nextElementSibling;
        }
        if (nextElement) {
          const codeBlock = nextElement.querySelector('code');
          if (codeBlock && window.tryExample) {
            window.tryExample(codeBlock.textContent);
          }
        }
        return false;
      };
    });
  }

  closeInstructionsModal() {
    this.dom.$('#instructionsModal').style.display = 'none';
  }

  updateStateTab() {
    const pre = document.createElement('pre');
    pre.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: "Courier New", monospace; font-size: 14px; line-height: 1.2; cursor: pointer;';
    pre.textContent = this.formatCubeDisplay(this.getCubeState(), v => v.toString().padStart(2, ' '), 1);
    pre.onclick = () => this.copyToClipboard();
    
    const tab = this.dom.get('stateTab');
    tab.innerHTML = '<p><strong>Sticker positions (0-53):</strong></p>';
    tab.appendChild(pre);
  }

  updateRotationsTab() {
    const rotations = this.getStickerRotations();
    const total = this.faces.reduce((sum, face) => 
      sum + rotations[face].reduce((a, b) => a + b, 0), 0);
    
    const pre = document.createElement('pre');
    pre.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: "Courier New", monospace; font-size: 14px; line-height: 1.2; cursor: pointer;';
    pre.textContent = this.formatCubeDisplay(rotations);
    pre.onclick = () => this.copyToClipboard();
    
    const tab = this.dom.get('rotationsTab');
    tab.innerHTML = `<p><strong>Total rotations:</strong> ${total}</p>`;
    tab.appendChild(pre);
  }

  formatCubeDisplay(data, formatter = v => v, extraLabelSpacing = 0) {
    if (!data || typeof data !== 'object') return '';
    const f = formatter;
    const vals = Object.values(data).flat().map(f);
    const w = Math.max(1, ...vals.map(v => v.toString().length));
    const pad = v => f(v).toString().padStart(w, ' ');
    const row = (face, start) => {
      if (!data[face]) return '? ? ?';
      return `${pad(data[face][start])} ${pad(data[face][start+1])} ${pad(data[face][start+2])}`;
    };
    const faceWidth = w * 3 + 2;
    const midCol = w + 1;
    const indent = ' '.repeat(Math.max(0, faceWidth + 3));
    const labelIndent = ' '.repeat(Math.max(0, faceWidth + 3 + midCol));
    const labelGap = ' '.repeat(Math.max(0, faceWidth + 2));
    const extraSpace = ' '.repeat(Math.max(0, extraLabelSpacing));
    
    return `${extraSpace}${labelIndent}U
${indent}${row('U',0)}
${indent}${row('U',3)}
${indent}${row('U',6)}

${' '.repeat(midCol)}${extraSpace}L${labelGap}F${labelGap}R${labelGap}B
${row('L',0)}   ${row('F',0)}   ${row('R',0)}   ${row('B',0)}
${row('L',3)}   ${row('F',3)}   ${row('R',3)}   ${row('B',3)}
${row('L',6)}   ${row('F',6)}   ${row('R',6)}   ${row('B',6)}

${extraSpace}${labelIndent}D
${indent}${row('D',0)}
${indent}${row('D',3)}
${indent}${row('D',6)}`;
  }

  copyToClipboard() {
    const stateDisplay = this.formatCubeDisplay(this.getCubeState(), v => v.toString().padStart(2, ' '), 1);
    const rotationsDisplay = this.formatCubeDisplay(this.getStickerRotations());
    const text = `----STICKERS----\n\n${stateDisplay}\n\n----ROTATIONS----\n\n${rotationsDisplay}`;
    
    navigator.clipboard.writeText(text).then(() => {
      if (window.uiControls) window.uiControls.showToast('Copied to clipboard!');
    });
  }

  switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tab}')"]`)?.classList.add('active');
    this.dom.$(`#${tab}Tab`)?.classList.add('active');
  }
}
