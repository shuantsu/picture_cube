# Análise do Texture Editor - dist/editor/index.html

**Data:** Análise completa  
**Arquivo:** dist/editor/index.html (~1400 linhas)  
**Tipo:** HTML + CSS + JavaScript (jQuery UI)  
**Status:** Em desenvolvimento (bugfixing)

---

## 🎯 VISÃO GERAL

### O Que É
- **Editor visual de texturas** para Picture Cube
- **Interface drag & drop** (jQuery UI)
- **3 painéis:** Texture Library | Cube Visual | Controls
- **Preview em tempo real** com iframe
- **Export/Import JSON**

### Arquitetura
```
[Texture Library]  [Cube Visual]  [Controls]
   (300px)           (flex: 1)      (300px)
   
   - Add textures    - 2D net      - Variables
   - Edit/Delete     - Click to    - Actions
   - Select          assign         - JSON output
```

---

## 🔥 DESCOBERTAS IMPORTANTES

### 1. **SISTEMA DE HERANÇA COMPLEXO!**
```javascript
// Linha ~730 - assignTexture()
if (sticker !== null) {
  const hasFaceTexture = cubeAssignments[faceKey];
  const currentSticker = cubeAssignments[key];
  
  if (!currentSticker && hasFaceTexture) {
    // Sticker sem assignment mas face tem → inherit mode [texture]
    const texValue = textureLibrary[selectedTexture];
    const isColorOrVar = texValue?.startsWith('#') || varsLibrary[selectedTexture];
    cubeAssignments[key] = isColorOrVar ? selectedTexture : [selectedTexture];
  }
}
```

**LÓGICA DE CLIQUES:**
1. **Sem assignment + Face tem textura** → `[texture]` (inherit)
2. **Inherit[1]** → Stack[2] (adiciona segunda camada)
3. **Stack[2]** → Replace (substitui tudo)
4. **Single texture** → Inherit[1] (se diferente)

**ISSO EXPLICA A HERANÇA!**
- Cores/vars usam string simples
- Texturas usam array `[texture]` pra herdar
- Sistema de 3 estados: None → Inherit → Stack → Replace

### 2. **GERAÇÃO DE JSON INTELIGENTE!**
```javascript
// Linha ~900 - generateConfig()
// Analisa uso de texturas
Object.entries(cubeAssignments).forEach(([key, textureNameOrArray]) => {
  // Single letter = whole face (sprite), otherwise individual sticker (spread)
  if (key.length === 1) {
    textureUsage[textureName].sprite = true;
  } else {
    textureUsage[textureName].spread = true;
  }
});

// Gera _sprite e _spread automaticamente
if (usage.sprite) {
  config.textures[`${textureName}_sprite`] = {
    backgroundImage: baseTexture,
    backgroundSize: '300% 300%'
  };
}

if (usage.spread) {
  config.textures[`${textureName}_spread`] = {
    backgroundImage: baseTexture,
    backgroundSize: 'cover'
  };
}
```

**GENIAL!** 🧠
- Detecta automaticamente se textura é usada em face inteira ou sticker individual
- Gera `_sprite` (300% 300%) pra faces
- Gera `_spread` (cover) pra stickers
- Cores vão pra `vars` automaticamente

### 3. **SISTEMA DE VARIÁVEIS COMPLETO!**
```javascript
// Linha ~1200 - replaceVars()
function replaceVars(value, vars) {
  if (typeof value === 'string') {
    return value.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
      return vars[varName] !== undefined ? vars[varName] : match;
    });
  }
}

// Tracking de texturas que usam vars
let originalTextures = {}; // Original com $vars
let textureUsesVars = {}; // Track quais usam
```

**SISTEMA DUAL:**
- `originalTextures` guarda valor com `$vars`
- `textureLibrary` guarda valor resolvido
- Quando var muda, re-resolve todas as texturas

### 4. **PREVIEW COM IFRAME!**
```javascript
// Linha ~1300 - testInCube()
function testInCube() {
  const config = generateConfig();
  const base64 = btoa(JSON.stringify(config));
  const url = `../index.php#${base64}`;
  
  // jQuery UI Dialog
  $('#preview-modal').dialog({
    width: 1200,
    height: 800,
    modal: false,
    resizable: true,
    draggable: true
  });
}
```

**FEATURES:**
- Preview em janela flutuante (jQuery UI Dialog)
- Resizable e draggable
- Salva posição/tamanho no localStorage
- Auto-refresh opcional
- Comunicação via postMessage (ESC fecha)

### 5. **GRADIENT BUILDER!**
```javascript
// Linha ~650 - buildGradient()
function buildGradient() {
  const type = document.getElementById('grad-type').value;
  const angle = document.getElementById('grad-angle').value;
  const c1 = document.getElementById('grad-color1').value;
  const c2 = document.getElementById('grad-color2').value;
  
  if (type === 'linear') {
    gradient = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
  } else if (type === 'radial') {
    gradient = `radial-gradient(circle, ${c1}, ${c2})`;
  } else {
    gradient = `conic-gradient(from ${angle}deg, ${c1}, ${c2})`;
  }
}
```

**UI HELPER:**
- 3 tipos: linear, radial, conic
- 2 color pickers
- Angle input
- Preview em tempo real
- Apply to textarea

### 6. **COLOR NAME DETECTION!**
```javascript
// Linha ~800 - getColorName()
function getColorName(hex) {
  const colors = {
    'CD5C5C':'indianred',
    'F08080':'lightcoral',
    // ... 140 HTML colors
  };
  
  // Closest color by RGB distance
  const dist = Math.sqrt((r-cr)**2 + (g-cg)**2 + (b-cb)**2);
}
```

**SMART NAMING:**
- 140 HTML color names
- Calcula distância RGB
- Auto-nomeia cores adicionadas
- Auto-increment se nome existe

### 7. **IMAGE OPTIMIZATION!**
```javascript
// Linha ~1100 - image upload
const maxSize = 250;
if (width > maxSize || height > maxSize) {
  // Resize mantendo aspect ratio
}
canvas.toDataURL('image/jpeg', 0.7); // 70% quality
```

**OTIMIZAÇÃO:**
- Resize pra max 250px
- JPEG 70% quality
- Converte pra data URI
- Wraps em `url('...')`

---

## 🎨 FEATURES IMPLEMENTADAS

### Texture Library (Painel Esquerdo)
- ✅ Add color (color picker)
- ✅ Upload image (resize + optimize)
- ✅ Add CSS/SVG (modal com textarea)
- ✅ Gradient builder (linear, radial, conic)
- ✅ Edit texture (modal ou color picker)
- ✅ Delete texture
- ✅ Select texture (highlight)
- ✅ Preview visual de cada textura

### Cube Visual (Painel Central)
- ✅ 2D net layout
- ✅ 6 faces (U, L, F, R, B, D)
- ✅ 9 stickers por face
- ✅ 2 modos: Whole Face | Individual Sticker
- ✅ Click to assign texture
- ✅ Hover highlight
- ✅ Zoom (scroll wheel)
- ✅ Pan (drag background)

### Controls (Painel Direito)
- ✅ Variables management (add, edit, delete)
- ✅ Clear cube (com confirmação)
- ✅ Reset all (com confirmação)
- ✅ Export JSON (download)
- ✅ Import JSON (modal)
- ✅ JSON output (readonly textarea)
- ✅ Copy to clipboard
- ✅ Test in cube (iframe preview)
- ✅ Auto-refresh toggle
- ✅ Share design (URL com base64)

### Modals
- ✅ CSS/SVG texture modal
- ✅ Import JSON modal
- ✅ Variable modal
- ✅ Confirm modal (clear/reset)
- ✅ Preview modal (jQuery UI Dialog)

---

## 🐛 BUGS E LIMITAÇÕES

### Bugs Conhecidos
1. **Sprite sheets "messy"** (você mencionou no fórum)
   - Sistema gera `_sprite` e `_spread` automaticamente
   - Pode ter edge cases

2. **Herança complexa**
   - Lógica de 3 estados pode confundir usuário
   - Sem feedback visual do estado atual

3. **No undo/redo**
   - Sem histórico de ações
   - Difícil reverter erros

### Limitações
1. **Sem layer reordering**
   - Arrays sempre [base, overlay]
   - Não dá pra trocar ordem

2. **Max 2 layers**
   - Limitação do sistema unificado
   - Não suporta mais camadas

3. **Sem rotation preview**
   - Não mostra como texturas giram
   - Importante pra supercubes

4. **Mobile não suportado**
   - Layout fixo de 3 painéis
   - Precisa responsive design

---

## 💡 ARQUITETURA DE DADOS

### Estado Global
```javascript
let varsLibrary = {};           // Variables ($name: value)
let textureLibrary = {};        // Resolved textures (strings)
let originalTextures = {};      // Original with $vars
let textureUsesVars = {};       // Track which use vars
let cubeAssignments = {};       // {face/sticker: texture/array}
let selectedTexture = null;     // Currently selected
let currentMode = 'face';       // 'face' or 'sticker'
```

### Cube Assignments Format
```javascript
cubeAssignments = {
  "U": "red",                   // Whole face
  "U0": "blue",                 // Individual sticker (replace)
  "U1": ["red", "star"],        // Layered (base + overlay)
  "F": "photo",                 // Whole face with image
  "F4": ["photo"]               // Inherit face + overlay
}
```

### Generated JSON Format
```javascript
{
  "vars": {
    "red": "#c41e3a",           // Colors go to vars
    "url": "https://..."        // User-defined vars
  },
  "textures": {
    "photo_sprite": {           // Auto-generated for faces
      "backgroundImage": "url('...')",
      "backgroundSize": "300% 300%"
    },
    "photo_spread": {           // Auto-generated for stickers
      "backgroundImage": "url('...')",
      "backgroundSize": "cover"
    }
  },
  "cube": {
    "U": "$red",                // Var reference
    "F": "textures.photo_sprite",
    "F4": ["textures.photo_sprite", "textures.star_spread"]
  }
}
```

---

## 🎯 FLUXO DE TRABALHO

### 1. Adicionar Texturas
```
User → Add Color/Image/CSS → Texture Library
     → Select texture → Highlight
```

### 2. Assignar ao Cubo
```
User → Select mode (face/sticker)
     → Click cube → Assign texture
     → Visual update → JSON update
```

### 3. Usar Variáveis
```
User → Add variable ($name = value)
     → Use in texture ($name)
     → Auto-resolve → Update all
```

### 4. Preview
```
User → Test in Cube → Generate JSON
     → Base64 encode → Open iframe
     → Auto-refresh (optional)
```

### 5. Export/Share
```
User → Export JSON → Download file
     → Share Design → Copy URL with base64
```

---

## 🔧 TECNOLOGIAS USADAS

### Libraries
- **jQuery 3.6.0** - DOM manipulation
- **jQuery UI 1.13.2** - Dialog, draggable, resizable
- **Canvas API** - Image resize/optimize
- **FileReader API** - Image upload
- **Clipboard API** - Copy to clipboard
- **localStorage** - Save preferences

### CSS Features
- **CSS Grid** - Layout de 3 painéis
- **Flexbox** - Internal layouts
- **CSS Transforms** - Zoom e pan
- **CSS Transitions** - Smooth animations

### JavaScript Features
- **ES6+** - Arrow functions, destructuring, template literals
- **Regex** - Variable replacement, color detection
- **Base64** - URL encoding
- **JSON** - Config serialization
- **postMessage** - Iframe communication

---

## 🎨 UI/UX FEATURES

### Visual Feedback
- ✅ Hover effects (borders, shadows)
- ✅ Selected state (green border)
- ✅ Toast notifications (bottom right)
- ✅ Loading states (none yet?)
- ✅ Confirm modals (destructive actions)

### Keyboard Shortcuts
- ❌ Nenhum implementado
- 💡 Poderia ter: Ctrl+Z (undo), Ctrl+S (export), etc

### Accessibility
- ⚠️ Sem ARIA labels
- ⚠️ Sem keyboard navigation
- ⚠️ user-select: none (pode dificultar)

---

## 📊 COMPARAÇÃO COM MAIN APP

### Semelhanças
- ✅ Mesmo formato JSON (unified system)
- ✅ Mesma lógica de texturas
- ✅ Mesmo sistema de variáveis
- ✅ Preview usa o main app

### Diferenças
- ❌ Editor não tem movimentos (só visual)
- ❌ Editor não tem rotações
- ❌ Editor não tem 3D view
- ✅ Editor tem UI visual (main app é JSON)
- ✅ Editor tem gradient builder
- ✅ Editor tem image optimization

---

## 🚀 MELHORIAS SUGERIDAS

### Curto Prazo (Bugfixing)
1. **Visual feedback do estado de herança**
   - Mostrar se sticker é: None | Inherit | Stack | Replace
   - Badge ou ícone no sticker

2. **Undo/Redo**
   - Histórico de ações
   - Ctrl+Z / Ctrl+Y

3. **Keyboard shortcuts**
   - Delete key pra remover assignment
   - Escape pra deselect
   - Ctrl+S pra export

4. **Loading states**
   - Spinner ao carregar imagens
   - Feedback ao gerar JSON

### Médio Prazo (Features)
1. **Drag & drop de imagens**
   - Arrastar imagem direto pro cube
   - Arrastar entre stickers

2. **Copy/Paste assignments**
   - Copiar textura de um sticker
   - Colar em outro

3. **Rotation preview**
   - Mostrar como textura gira
   - Importante pra supercubes

4. **Templates/Presets**
   - Salvar designs favoritos
   - Galeria de exemplos

### Longo Prazo (Polish)
1. **Mobile responsive**
   - Layout adaptativo
   - Touch gestures

2. **Collaborative editing**
   - Share link pra editar junto
   - Real-time sync

3. **Texture marketplace**
   - Compartilhar designs
   - Votar/comentar

---

## 🎯 CONCLUSÃO

### O Editor É:
- ✅ **Funcional** - Core features funcionam
- ✅ **Inteligente** - Auto-gera sprite/spread
- ✅ **Visual** - UI intuitiva
- ⚠️ **Em desenvolvimento** - Precisa polish
- ⚠️ **Desktop-only** - Não é responsive
- 🐛 **Com bugs** - Sprite sheets "messy"

### Pontos Fortes:
1. **Geração automática de JSON** (sprite/spread)
2. **Sistema de variáveis completo**
3. **Preview em tempo real**
4. **Gradient builder**
5. **Image optimization**
6. **Color name detection**

### Pontos Fracos:
1. **Herança complexa** (confusa)
2. **Sem undo/redo**
3. **Sem keyboard shortcuts**
4. **Não é mobile-friendly**
5. **Sem feedback visual de estados**

### Comparado ao Main App:
- **Editor:** Foco em criação visual
- **Main App:** Foco em simulação e algoritmos
- **Integração:** Preview usa main app (iframe)
- **Complementares:** Editor cria, main app testa

---

## 💭 REFLEXÕES FINAIS

### Por que você disse "bugfixing"?
Possíveis bugs:
1. Sprite sheets não funcionam em todos os casos
2. Herança pode ter edge cases
3. Variables podem não resolver corretamente
4. Preview pode não atualizar sempre

### O que falta pra lançar?
1. Testar todos os edge cases
2. Adicionar feedback visual
3. Melhorar UX de herança
4. Documentar como usar
5. Criar tutorial/onboarding

### Potencial do Editor:
- 🎯 **Democratiza criação** (sem JSON manual)
- 🎨 **Acelera workflow** (visual > código)
- 🚀 **Atrai mais usuários** (menos técnico)
- 💡 **Abre possibilidades** (marketplace, templates)

---

**ESSE EDITOR É AMBICIOSO E BEM PENSADO!** 🎉

Agora entendo por que você tá no bugfixing - tem muita lógica complexa (herança, sprite/spread, variáveis) que precisa funcionar perfeitamente antes de lançar.

**Pronto pra documentação final?** 📝
