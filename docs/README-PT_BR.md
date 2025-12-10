# Picture Cube - Documentação Técnica

**[Read in English](README.md)** | **Português**

**Última atualização:** 10/dez/2025  
**Versão:** 1.0.0 (Pós-refatoração Fase 1)

---

## Visão Geral

Picture Cube é um simulador 3D de cubo Rubik com suporte a texturas customizadas, head tracking via webcam, e integração com cubos Bluetooth (GiiKER).

**Principais Recursos:**
- 3 modos de visualização (2D net, 3D ortográfico, 3D perspectiva)
- Sistema de texturas unificado com editor visual
- Head tracking com MediaPipe Face Mesh
- Histórico de movimentos com árvore de ramificação
- Suporte a cubo Bluetooth GiiKER
- 12 texturas pré-configuradas

---

## Estrutura do Projeto

```
__PICTURE_CUBE/
├── src/                       # Código fonte (dev)
│   ├── index.html            # HTML principal
│   ├── css/style.css         # Estilos
│   ├── js/                   # Módulos JavaScript
│   ├── backgrounds/          # Galeria de backgrounds
│   ├── examples/             # Texturas de exemplo
│   └── editor/               # Editor de texturas (iframe)
├── build/                     # Build de produção (Vite)
├── scripts/                   # Scripts de build
│   ├── prebuild.js           # Gera arquivos de índice e thumbnails
│   └── generate-scramble.js  # Gerador de scrambles
├── package.json              # Dependências e scripts npm
├── vite.config.js            # Configuração do Vite
└── index.php                 # File browser (dev)
```

---

## Arquitetura de Módulos

### Módulos JavaScript (`src/js/`)

#### **app.js** (1268 linhas) - Orquestrador Principal
- Inicializa todos os módulos
- Coordena comunicação entre componentes
- Gerencia estado global da aplicação
- Funções wrapper para HTML onclick handlers

#### **cube-core.js** - Motor do Cubo
- Lógica do cubo Rubik (54 stickers)
- Algoritmos de movimentos (R, U, F, L, B, D + variações)
- Movimentos slice (M, E, S)
- Movimentos wide (Rw, Lw, Uw, etc)
- Rotações de cubo (x, y, z)
- Rastreamento de rotação de stickers (0-3 = 0°-270°)

#### **texture-manager.js** - Sistema de Texturas
- Carrega e aplica configurações de textura
- Sistema unificado: `textures` + `cube`
- Suporte a CSS inline, URLs, gradientes
- Layering (múltiplas texturas por sticker)
- Wildcard selector (`"*"`)
- Herança automática

#### **cube-view.js** - Camada de Abstração de Renderização
- Interface comum para todos os renderizadores
- Gerencia transição entre modos de visualização

#### **cubenet-renderer.js** - Renderizador 2D
- Renderiza cubo como net 2D planificado
- Suporte a zoom e pan

#### **perspective-renderer.js** - Renderizador 3D Perspectiva
- Renderização 3D com perspectiva
- Rotação livre do cubo

#### **isometric-renderer.js** - Renderizador 3D Ortográfico
- Renderização 3D sem perspectiva (isométrico)
- Rotação livre do cubo

#### **ui-controls.js** - Controles de Interface
- Controles de acessibilidade (escala UI, texto, largura painel)
- Seleção e dimensionamento de background
- Gerenciamento de sidebar e accordions
- Notificações toast
- Persistência de estado em localStorage

#### **camera-tracking.js** - Head Tracking
- Enumeração de câmeras disponíveis
- Integração com MediaPipe Face Mesh
- Sistema de calibração
- Cálculo de rotação baseado em landmarks faciais
- Efeito parallax de background
- Persistência de configurações

#### **history-manager.js** - Histórico de Movimentos
- Estrutura de árvore para histórico
- Suporte a ramificação (explorar soluções alternativas)
- Visualização em canvas com pan/zoom
- Grid view do caminho atual
- Restauração de estado

#### **algorithm-parser.js** - Parser de Algoritmos
- Parse de notação de cubo (R, U', F2, etc)
- Remoção de comentários
- Execução em lote
- Integração com histórico

#### **bluetooth.js** - Integração Bluetooth
- Conexão com cubo GiiKER
- Detecção de movimentos em tempo real
- Callbacks para eventos (connect, disconnect, move, error)

#### **scramble.js** - Gerador de Scrambles
- Scrambles pré-gerados (otimização)
- Seleção aleatória

#### **backgrounds.js** - Galeria de Backgrounds
- Índice de backgrounds disponíveis
- Thumbnails e metadados

#### **texture-instructions.js** - Documentação do Sistema de Texturas
- Instruções embutidas
- Exemplos de uso

#### **window-manager.js** - Gerenciador de Janelas
- Gerencia janela flutuante de preview 3D
- Drag and drop, resize

#### **marked.min.js** - Parser Markdown
- Renderiza instruções em markdown

---

## index.html - Estrutura

### Layout Principal
```html
<body>
  <button id="hamburger">        <!-- Toggle sidebar -->
  <button id="togglePanel">      <!-- Toggle painel esquerdo -->
  <button id="fullscreenBtn">    <!-- Fullscreen -->
  
  <div id="container">
    <div id="controls">          <!-- Painel esquerdo (sidebar) -->
      <!-- Accordions com controles -->
    </div>
    
    <div id="right-panel">       <!-- Área de visualização -->
      <iframe id="editor-iframe"> <!-- Editor de texturas -->
      <div id="cube-net">        <!-- Cubo 2D -->
      <div id="cube-3d-wrapper"> <!-- Cubo 3D -->
      <div id="cube-3d-window">  <!-- Preview 3D flutuante -->
    </div>
  </div>
  
  <!-- Modals -->
  <div id="instructionsModal">   <!-- Instruções de texturas -->
  <div id="stateModal">          <!-- Análise de estado -->
  <div id="toast">               <!-- Notificações -->
</body>
```

### Accordions (Painel de Controles)
1. **Moveset** - Botões de movimentos básicos
2. **Algorithm** - Input de algoritmos + scramble
3. **Bluetooth Cube** - Conexão com cubo físico
4. **Camera Control** - Head tracking + calibração
5. **State** - Reset e visualização de estado
6. **History** - Histórico com árvore de ramificação
7. **Example Textures** - Texturas pré-configuradas
8. **Custom Textures** - Editor JSON de texturas
9. **Background** - Galeria e controles de background
10. **Visualization** - Modos de visualização + crisp mode
11. **Accessibility** - Controles de acessibilidade

---

## Sistema de Build (Vite)

### Scripts npm
```bash
pnpm dev        # Servidor de desenvolvimento (porta 8000)
pnpm build      # Build de produção (src/ → build/)
pnpm preview    # Preview do build
```

### Fluxo de Build
1. **prebuild.js** executa antes do build:
   - Gera backgrounds/index.json
   - Gera examples/index.json
   - Gera thumbnails para imagens de backgrounds
   
2. **Vite** processa:
   - Bundling de JS modules
   - Minificação
   - Hash de assets
   - Output: `build/` folder

3. **vite-plugin-static-copy** copia:
   - `backgrounds/` (imagens)
   - `examples/` (JSONs de textura)
   - `editor/` (iframe do editor)
   - `texture.png` e `texture-instructions.md`

### Configuração (vite.config.js)
- **Root:** `src/` (código fonte)
- **Output:** `build/` (produção)
- **Base:** `./` (paths relativos)
- **Server:** porta 8000, auto-open

---

## Fluxo de Dados

### Execução de Movimento
```
User Input (botão/algoritmo/bluetooth)
    ↓
app.js: applyMove(move)
    ↓
cube-core.js: applyMove(move)
    ↓
app.js: syncState() → updateDOM()
    ↓
Renderer: render(state, rotations, textures)
    ↓
history-manager.js: addMove(move, state) [se habilitado]
```

### Camera Tracking
```
Camera Frame
    ↓
MediaPipe Face Mesh
    ↓
camera-tracking.js: onCameraResults()
    ↓
Calcula rotação de landmarks
    ↓
camera-tracking.js: onRotationChange(x, y)
    ↓
app.js: cubeRotation.x/y = x/y
    ↓
updateCubeRotation()
```

### Carregamento de Texturas
```
User Input (JSON config)
    ↓
app.js: loadCustomConfig()
    ↓
stripJsonComments() → JSON.parse()
    ↓
replaceVarsInConfig() [se vars presentes]
    ↓
texture-manager.js: loadUnifiedConfig(config)
    ↓
app.js: updateDOM()
```

---

## Sistema de Texturas

### Formato Unificado
```json
{
  "textures": {
    "red": "#c41e3a",
    "star": {
      "background": "url('star.svg')",
      "backgroundSize": "80%"
    }
  },
  "cube": {
    "U": "red",
    "U1": ["red", "star"],
    "*": "red"
  }
}
```

### Seletores de Sticker
- **Face inteira:** `"U"`, `"F"`, `"R"`, etc
- **Sticker individual:** `"U0"` a `"U8"` (0-8 por face)
- **Wildcard:** `"*"` (todos os stickers)

### Recursos
- CSS inline (color, background, border, etc)
- URLs de imagens
- Gradientes CSS
- Layering: `["base", "overlay"]`
- Herança automática

---

## Estado Atual (Pós-Refatoração)

### Fase 1 Completa (09/dez/2025)
- 800 linhas extraídas de app.js (36% redução)
- 4 módulos criados:
  - history-manager.js (~300 linhas)
  - camera-tracking.js (~300 linhas)
  - ui-controls.js (~150 linhas)
  - algorithm-parser.js (~50 linhas)

### Métricas
| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Linhas app.js | 2040 | 1268 | -772 (-38%) |
| Tamanho app.js | 70KB | 45KB | -25KB (-36%) |
| Módulos | 11 | 15 | +4 |

### Próximas Fases (Planejadas)
- Fase 2: Extrair view-manager, input-handler, state-modal
- Fase 3: Extrair config-loader, editor-bridge
- Fase 4: Setup de testes automatizados

---

## Problemas Conhecidos

- Rotação CSS 2D pode conflitar com transforms 3D (investigar)
- MediaPipe gera warnings no console (suprimidos)
- Mobile viewport height requer ajuste manual

---

## Desenvolvimento

### Setup Local
```bash
git clone <repo>
cd __PICTURE_CUBE
pnpm install
pnpm dev
```

### Estrutura de Desenvolvimento
- **Código fonte:** `src/`
- **Build:** `pnpm build` → `build/`
- **Deploy:** `deploy.bat` (FTP)

### Convenções
- ES6 modules (`type: "module"` no package.json)
- Classes para módulos principais
- Callbacks para comunicação entre módulos
- localStorage para persistência de estado
- Accordion state, sidebar state, camera calibration, etc

---

## Recursos Adicionais

- **Live Demo:** https://filipeteixeira.com.br/new/picturecube/
- **Vídeo:** https://www.youtube.com/watch?v=OOUIykqF7zs
- **Texture Instructions:** `src/texture-instructions.md`
- **Examples:** `src/examples/*.json`

---

**Dúvidas?** Consulte os arquivos de documentação em `docs/archive/` para contexto histórico.s no console (suprimidos)
- ⚠️ Mobile viewport height requer ajuste manual

---

## 🔧 Desenvolvimento

### Setup Local
```bash
git clone <repo>
cd __PICTURE_CUBE
pnpm install
pnpm dev
```

### Estrutura de Desenvolvimento
- **Código fonte:** `src/`
- **Build:** `pnpm build` → `build/`
- **Deploy:** `deploy.bat` (FTP)

### Convenções
- ES6 modules (`type: "module"` no package.json)
- Classes para módulos principais
- Callbacks para comunicação entre módulos
- localStorage para persistência de estado
- Accordion state, sidebar state, camera calibration, etc

---

## 📚 Recursos Adicionais

- **Live Demo:** https://filipeteixeira.com.br/new/picturecube/
- **Vídeo:** https://www.youtube.com/watch?v=OOUIykqF7zs
- **Texture Instructions:** `src/texture-instructions.md`
- **Examples:** `src/examples/*.json`

---

**Dúvidas?** Consulte os arquivos de documentação em `docs/archive/` para contexto histórico.
