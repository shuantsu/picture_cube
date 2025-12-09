// History Manager - Tree-based move history with visualization
const $ = (sel) => {
  if (sel.startsWith('#')) {
    return document.getElementById(sel.slice(1));
  }
  return document.querySelector(sel);
};

export class MoveNode {
  constructor(move, parent = null, state = null) {
    this.id = crypto?.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2,9);
    this.move = move;
    this.parent = parent;
    this.children = [];
    this.state = state;
    this.timestamp = new Date().toLocaleTimeString();
  }
}

export class HistoryManager {
  constructor() {
    this.root = null;
    this.currentNode = null;
    this.transform = { x: 0, y: 0, scale: 1 };
    this.canvas = null;
    this.ctx = null;
    this.positions = {};
    this.isPanning = false;
    this.lastPanPoint = { x: 0, y: 0 };
    this.onStateRestore = null;
    
    this.XSTEP = 120;
    this.YSTEP = 60;
    this.NODE_W = 80;
    this.NODE_H = 32;
  }

  init(initialState) {
    this.root = new MoveNode('START', null, initialState);
    this.currentNode = this.root;
    this.transform = { x: 0, y: 0, scale: 1 };
  }

  addMove(move, state) {
    const newNode = new MoveNode(move, this.currentNode, state);
    this.currentNode.children.push(newNode);
    this.currentNode = newNode;
    this.updateDisplay();
  }

  selectNode(nodeId) {
    const node = this.findNodeById(this.root, nodeId);
    if (!node || !node.state) return false;
    
    this.currentNode = node;
    if (this.onStateRestore) this.onStateRestore(node.state);
    this.updateDisplay();
    return true;
  }

  clear() {
    if (this.root && this.root.state) {
      this.init(this.root.state);
    }
    this.updateDisplay();
  }

  findNodeById(root, id) {
    let found = null;
    const dfs = (n) => {
      if (n.id === id) { found = n; return; }
      for (const c of n.children) {
        dfs(c);
        if (found) return;
      }
    };
    dfs(root);
    return found;
  }

  getPathToNode(node) {
    const path = [];
    let cur = node;
    while (cur) {
      path.push(cur);
      cur = cur.parent;
    }
    return path.reverse();
  }

  layoutTree(root) {
    let branchCounter = 0;
    const positions = {};

    const dfs = (node, depth, branchIndex) => {
      const x = depth * this.XSTEP;
      const y = branchIndex * this.YSTEP;
      positions[node.id] = {x, y, node};
      
      for (let i = 0; i < node.children.length; i++) {
        const c = node.children[i];
        if (i === 0) {
          dfs(c, depth + 1, branchIndex);
        } else {
          branchCounter++;
          dfs(c, depth + 1, branchCounter);
        }
      }
    };

    dfs(root, 0, 0);
    return positions;
  }

  initCanvas(container) {
    container.innerHTML = '';
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'historyCanvas';
    this.canvas.style.cssText = 'width:100%;height:100%;cursor:default';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }
    
    this.attachEvents();
  }

  attachEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - this.transform.x) / this.transform.scale;
      const y = (e.clientY - rect.top - this.transform.y) / this.transform.scale;
      
      let clicked = false;
      for (const id in this.positions) {
        const p = this.positions[id];
        if (x >= p.x && x <= p.x + this.NODE_W && y >= p.y && y <= p.y + this.NODE_H) {
          this.selectNode(p.node.id);
          clicked = true;
          break;
        }
      }
      
      if (!clicked && e.button === 0) {
        this.isPanning = true;
        this.lastPanPoint = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        const dx = (e.clientX - this.lastPanPoint.x) * 1.2;
        const dy = (e.clientY - this.lastPanPoint.y) * 1.2;
        this.transform.x += dx;
        this.transform.y += dy;
        this.lastPanPoint = { x: e.clientX, y: e.clientY };
        this.renderCanvas();
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        if (this.canvas) this.canvas.style.cursor = 'default';
      }
    });
    
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, this.transform.scale * scaleFactor));
      
      const scaleChange = newScale / this.transform.scale;
      this.transform.x = mouseX - (mouseX - this.transform.x) * scaleChange;
      this.transform.y = mouseY - (mouseY - this.transform.y) * scaleChange;
      this.transform.scale = newScale;
      
      this.renderCanvas();
    }, { passive: false });
  }

  updateDisplay() {
    if (!this.root) return;
    
    const container = $('#historyGraph');
    if (!this.canvas) this.initCanvas(container);
    
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    this.positions = this.layoutTree(this.root);
    this.renderCanvas();
    this.updateGrid();
  }

  renderCanvas() {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);
    
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    for (const id in this.positions) {
      const p = this.positions[id];
      for (const child of p.node.children) {
        const cpos = this.positions[child.id];
        if (!cpos) continue;
        const x1 = p.x + this.NODE_W, y1 = p.y + this.NODE_H/2;
        const x2 = cpos.x, y2 = cpos.y + this.NODE_H/2;
        const midX = (x1 + x2) / 2;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(midX, y1, midX, y2, x2, y2);
        ctx.stroke();
      }
    }
    
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (const id in this.positions) {
      const p = this.positions[id];
      const isCurrent = this.currentNode.id === p.node.id;
      
      ctx.fillStyle = isCurrent ? '#2d5016' : '#1a1a1a';
      ctx.strokeStyle = isCurrent ? '#4caf50' : '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, this.NODE_W, this.NODE_H, 6);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.fillText(p.node.move === 'START' ? 'START' : p.node.move, p.x + this.NODE_W/2, p.y + this.NODE_H/2);
      
      if (p.node.children.length > 1) {
        ctx.fillStyle = '#4caf50';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(p.node.children.length, p.x + this.NODE_W - 8, p.y + 16);
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
      }
    }
    
    ctx.restore();
  }

  updateGrid() {
    const gridContainer = $('#historyRows');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    const path = this.getPathToNode(this.currentNode);
    
    path.forEach((node, index) => {
      const row = document.createElement('div');
      row.className = 'history-row' + (node.id === this.currentNode.id ? ' current' : '');
      row.onclick = () => this.selectNode(node.id);
      
      const branchInfo = node.children.length > 1 ? ` <span style="color:#4caf50;font-weight:bold">(${node.children.length})</span>` : '';
      row.innerHTML = `
        <div class="history-cell">${node.timestamp}</div>
        <div class="history-cell">${node.move}${branchInfo}</div>
        <div class="history-cell">${index}</div>
      `;
      gridContainer.appendChild(row);
    });
    
    if (this.currentNode.children.length > 0) {
      const nextRow = document.createElement('div');
      nextRow.className = 'history-row history-next';
      nextRow.style.cssText = 'background:#f0f8ff;border-left:3px solid #4caf50';
      
      nextRow.innerHTML = `
        <div class="history-cell">→</div>
        <div class="history-cell" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center"></div>
        <div class="history-cell">+</div>
      `;
      
      const moveCell = nextRow.children[1];
      this.currentNode.children.forEach(child => {
        const pill = document.createElement('span');
        pill.textContent = child.move;
        pill.style.cssText = 'background:#4caf50;color:white;padding:2px 8px;border-radius:12px;cursor:pointer;font-size:11px;font-weight:bold';
        pill.onclick = (e) => {
          e.stopPropagation();
          this.selectNode(child.id);
        };
        pill.onmouseenter = () => pill.style.background = '#45a049';
        pill.onmouseleave = () => pill.style.background = '#4caf50';
        moveCell.appendChild(pill);
      });
      
      gridContainer.appendChild(nextRow);
    }
  }
}
