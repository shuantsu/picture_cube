# Plano de Ação: Simulador Cubo 3x3x3 Avançado

## Visão Geral do Projeto

Criar um **Picture Cube 100% Funcional** - simulador de cubo mágico customizado que suporte:

### **Feature 1: Sistema de Estados Customizados**
- Definir **índices próprios de stickers** (1 a N tipos)
- Criar **estado inicial personalizado** do cubo
- **Mapeamento livre** sticker ↔ posição

### **Feature 2: Sistema de Texturas por Face** 
- **1 a 6 texturas diferentes** (uma por face ou compartilhadas)
- **Auto-sprite**: algoritmo divide textura em grade 3x3 automaticamente
- **Texturas universais**: cor, gradiente, dataURI, SVG, URL, CSS arbitrário
- **Rotação realística**: stickers mantêm orientação física correta

### **Resultado Final**
- **Picture Cube completo**: imagens divididas automaticamente em 9 partes
- **Cubo temático**: cada face com textura diferente
- **Cubo artístico**: combinação livre de texturas e estados

## Estratégia de Implementação

### Fase 1: Refatoração da Arquitetura Base
**Prioridade: CRÍTICA | Duração: 30 minutos**

#### 1.1 Novo Modelo de Dados Unificado
```javascript
// Modelo híbrido: suporta ambos os modos
const stickerData = {
  // FEATURE 1: Índices customizados
  stickerIndex: 0,   // índice definido pelo usuário (0 a N)
  
  // FEATURE 2: Sistema de texturas
  faceTexture: 'U',  // qual textura usar ('U','L','F','R','B','D')
  spritePosition: 0, // posição na grade 3x3 (0-8)
  
  // COMUM: Rotação física
  rotation: 0,       // rotação em graus (0, 90, 180, 270)
  
  // METADADOS
  originalFace: 'U', // face de origem (para tracking)
  originalPos: 0     // posição original (para tracking)
};
```

#### 1.2 Sistema de Configuração Dual
```javascript
const CubeConfig = {
  mode: 'custom_indices' | 'face_textures',
  
  // FEATURE 1: Índices customizados
  customStickers: {
    0: { background: 'red' },
    1: { background: 'linear-gradient(45deg, blue, cyan)' },
    2: { backgroundImage: 'url(data:image/...)' }
    // ... N stickers definidos pelo usuário
  },
  
  // FEATURE 2: Texturas por face
  faceTextures: {
    'U': { background: 'url(image1.jpg)' },
    'L': { background: 'linear-gradient(...)' },
    'F': { background: 'url(image2.jpg)' },
    'R': { background: '#ff0000' },
    'B': { background: 'url(image2.jpg)' }, // reutiliza textura
    'D': { background: 'radial-gradient(...)' }
  }
};
```

#### 1.3 Refatoração das Funções Core
- `setColor()` → `setStickerStyle(face, index, stickerData)`
- `serializeCube()` → suporte ao novo formato de dados
- `deserializeCube()` → compatibilidade com formatos antigos e novos

---

### Fase 2: Feature 1 - Sistema de Índices Customizados
**Prioridade: ALTA | Duração: 25 minutos**

#### 2.1 Sistema de Índices Livres
```javascript
const CustomIndexSystem = {
  // Definir quantos tipos de stickers existem
  stickerCount: 5, // usuário define (1 a N)
  
  // Definir aparência de cada índice
  stickerStyles: {
    0: { background: 'red' },
    1: { background: 'blue' },
    2: { background: 'url(data:image/...)' },
    3: { background: 'linear-gradient(45deg, yellow, orange)' },
    4: { background: 'green' }
  },
  
  // Estado inicial do cubo (usuário define)
  initialState: {
    U: [0,1,2, 1,0,1, 2,1,0], // face U com índices customizados
    L: [3,3,3, 4,4,4, 3,3,3], // face L com outros índices
    F: [2,0,2, 0,2,0, 2,0,2], // padrão xadrez
    // ... outras faces
  }
};
```

#### 2.2 Interface de Biblioteca de Adesivos
- **Painel de Adesivos**: Grid visual com todos os adesivos criados
- **Editor de Adesivos**: Criar/editar adesivos individuais
- **Gerenciador de Esquemas**: Salvar/carregar configurações completas do cubo
- **Marketplace Local**: Presets populares (Rubik clássico, Neon, Madeira, etc.)
- **Import/Export**: JSON para compartilhar esquemas

#### 2.3 Migração de Estado
- Função para converter estados antigos (6 cores) para novo formato
- Mapeamento automático de cores para índices customizados

---

### Fase 3: Feature 2 - Sistema de Texturas por Face
**Prioridade: ALTA | Duração: 30 minutos**

#### 3.1 Sistema de Auto-Sprite por Face
```javascript
const FaceTextureSystem = {
  // Texturas definidas pelo usuário (1 a 6)
  textures: {
    'U': { background: 'url(mona_lisa.jpg)' },
    'F': { background: 'linear-gradient(45deg, #ff0000, #00ff00)' },
    'R': { background: '#0066cc' },
    // L, B, D podem reutilizar texturas existentes
  },
  
  // Auto-geração de sprites 3x3
  generateSprites(face, texture) {
    const sprites = [];
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      sprites[i] = {
        ...texture,
        backgroundPosition: `-${col * 33.33}% -${row * 33.33}%`,
        backgroundSize: '300% 300%',
        backgroundRepeat: 'no-repeat'
      };
    }
    return sprites;
  }
};
```

#### 3.2 Ferramentas de Upload
- Input file para carregar imagens
- Conversão automática para dataURI
- Preview em tempo real
- Controles para ajustar size/position

---

### Fase 4: Sistema de Rotação com Texturas
**Prioridade: CRÍTICA | Duração: 40 minutos**

#### 4.1 Rotação Inteligente de Texturas
```javascript
function applyStickerWithRotation(face, position, stickerData) {
  const element = getStickerElement(face, position);
  
  if (config.mode === 'custom_indices') {
    // FEATURE 1: Aplicar estilo do índice + rotação
    const style = config.customStickers[stickerData.stickerIndex];
    Object.assign(element.style, style);
    element.style.transform = `rotate(${stickerData.rotation}deg)`;
    
  } else if (config.mode === 'face_textures') {
    // FEATURE 2: Aplicar sprite da textura + rotação
    const texture = config.faceTextures[stickerData.faceTexture];
    const sprite = generateSprite(stickerData.spritePosition, texture);
    Object.assign(element.style, sprite);
    
    // Rotação preserva o sprite
    const transform = `rotate(${stickerData.rotation}deg)`;
    element.style.transform = transform;
  }
}
```

#### 4.2 Interface de Upload de Faces
- 6 inputs para imagens das faces (U, L, F, R, B, D)
- Preview do cubo com sprites aplicados
- Validação de formato e tamanho das imagens

---

### Fase 5: Movimentos com Preservação de Texturas
**Prioridade: CRÍTICA | Duração: 60 minutos**

#### 5.1 Preservação de Texturas em Movimentos
```javascript
function moveR() {
  const cube = getCubeState();
  
  // 1. Rotacionar face R (stickers rotacionam 90°)
  cube.R = rotateFaceStickers(cube.R, 90);
  
  // 2. Ciclo lateral preservando texturas
  const temp = [cube.F[2], cube.F[5], cube.F[8]];
  
  // Para FEATURE 1: manter stickerIndex, ajustar rotation
  // Para FEATURE 2: manter faceTexture+spritePosition, ajustar rotation
  
  cube.F[2] = adjustStickerForMove(cube.D[2], 'D->F');
  cube.F[5] = adjustStickerForMove(cube.D[5], 'D->F');
  cube.F[8] = adjustStickerForMove(cube.D[8], 'D->F');
  
  // ... resto do ciclo
}

function adjustStickerForMove(sticker, transition) {
  const rotationOffset = getTransitionRotation(transition);
  return {
    ...sticker,
    rotation: (sticker.rotation + rotationOffset) % 360
  };
}
```

#### 5.2 Refatoração Completa dos Movimentos
- Cada função de movimento (moveR, moveL, etc.) deve:
  1. Calcular novas posições dos stickers
  2. Calcular novas rotações baseadas na transição entre faces
  3. Aplicar rotação da face (90° para stickers que ficam na mesma face)

#### 5.3 Rotações de Cubo (x, y, z)
- Implementar transformações globais que afetam todos os stickers
- Matriz de rotação 3D para calcular novas orientações
- Manter consistência visual entre 2D e 3D

#### 5.4 Aplicação Visual da Rotação
```javascript
function applyStickerRotation(element, rotation) {
  const currentTransform = element.style.transform || '';
  const rotateTransform = `rotate(${rotation}deg)`;
  element.style.transform = `${currentTransform} ${rotateTransform}`;
}
```

---

### Fase 6: Interface Dual e Presets
**Prioridade: MÉDIA | Duração: 35 minutos**

#### 6.1 Interface Modo Duplo
```html
<!-- Seletor de Modo -->
<select id="cubeMode">
  <option value="custom_indices">Índices Customizados</option>
  <option value="face_textures">Texturas por Face</option>
</select>

<!-- FEATURE 1: Painel de Índices -->
<div id="customIndicesPanel">
  <input type="number" id="stickerCount" min="1" max="54" value="6">
  <div id="stickerEditor"><!-- Grid de N stickers --></div>
  <textarea id="initialState"><!-- Estado inicial JSON --></textarea>
</div>

<!-- FEATURE 2: Painel de Texturas -->
<div id="faceTexturesPanel">
  <div class="face-texture-editor">
    <label>Face U:</label>
    <input type="text" placeholder="CSS background" data-face="U">
    <input type="file" accept="image/*" data-face="U">
  </div>
  <!-- Repetir para L,F,R,B,D -->
</div>
```

#### 6.2 Presets para Ambos os Modos
```javascript
const PRESETS = {
  // FEATURE 1: Presets de índices
  custom_indices: {
    'rubik_classic': {
      stickerCount: 6,
      styles: { 0: {background: 'white'}, 1: {background: 'red'}, /*...*/ },
      initialState: { U: [0,0,0,0,0,0,0,0,0], L: [1,1,1,1,1,1,1,1,1], /*...*/ }
    },
    'checkerboard': {
      stickerCount: 2,
      styles: { 0: {background: 'black'}, 1: {background: 'white'} },
      initialState: { U: [0,1,0,1,0,1,0,1,0], /*...*/ }
    }
  },
  
  // FEATURE 2: Presets de texturas
  face_textures: {
    'mona_lisa': {
      textures: {
        U: {background: 'url(mona_lisa_top.jpg)'},
        F: {background: 'url(mona_lisa_front.jpg)'},
        /*...*/
      }
    },
    'gradient_cube': {
      textures: {
        U: {background: 'linear-gradient(45deg, red, yellow)'},
        L: {background: 'linear-gradient(45deg, blue, cyan)'},
        /*...*/
      }
    }
  }
};
```

#### 6.3 Editor Visual Avançado
- **Modo pintura**: Selecionar adesivo e "pintar" no cubo
- **Aplicação em massa**: Aplicar adesivo a face inteira ou camada
- **Randomização**: Gerar configurações aleatórias
- **Undo/Redo**: Histórico de modificações

---

### Fase 7: Otimização e Performance
**Prioridade: BAIXA | Duração: 15 minutos**

#### 7.1 Cache de Estilos
- Evitar recálculos desnecessários de sprites/rotações
- Lazy loading de imagens grandes
- Debounce em operações custosas

#### 7.2 Compatibilidade
- Fallbacks para navegadores antigos
- Detecção de suporte a CSS transforms
- Modo de compatibilidade simplificado

---

## Cronograma de Implementação

### Sessão 1 (1ª hora)
- **0-30min**: Fase 1 (Refatoração da Arquitetura Dual)
- **30-55min**: Fase 2 (Feature 1: Índices Customizados)
- **55-60min**: Início Fase 3 (Feature 2: Texturas)

### Sessão 2 (2ª hora)
- **0-25min**: Continuação Fase 3 (Feature 2: Texturas)
- **25-65min**: Fase 4 (Rotação com Texturas)

### Sessão 3 (3ª hora)
- **0-60min**: Fase 5 (Movimentos com Preservação de Texturas)

### Sessão 4 (4ª hora)
- **0-35min**: Fase 6 (Interface Dual e Presets)
- **35-42min**: Fase 7 (Otimização)
- **42-60min**: Testes + Criação de Picture Cubes exemplo

---

## Estrutura de Arquivos Proposta

```
yodacube_advanced/
├── index.html                 # Interface principal
├── css/
│   ├── cube.css              # Estilos do cubo
│   ├── controls.css          # Estilos dos controles
│   └── themes.css            # Temas visuais
├── js/
│   ├── core/
│   │   ├── CubeState.js      # Gerenciamento de estado
│   │   ├── StickerManager.js # Gerenciamento de adesivos
│   │   └── RotationEngine.js # Cálculos de rotação
│   ├── movements/
│   │   ├── BasicMoves.js     # R, L, U, D, F, B
│   │   ├── SliceMoves.js     # M, E, S
│   │   └── CubeRotations.js  # x, y, z
│   ├── ui/
│   │   ├── Controls.js       # Interface de controles
│   │   ├── StickerEditor.js  # Editor visual
│   │   └── ViewManager.js    # Gerenciamento de visualização
│   └── utils/
│       ├── ImageUtils.js     # Processamento de imagens
│       ├── MathUtils.js      # Cálculos matemáticos
│       └── StorageUtils.js   # Persistência de dados
└── assets/
    ├── presets/              # Configurações pré-definidas
    └── examples/             # Imagens de exemplo
```

---

## Riscos e Mitigações

### Risco Alto: Complexidade da Rotação de Stickers
**Mitigação**: 
- Implementar em etapas incrementais
- Criar testes unitários para cada tipo de movimento
- Manter versão simplificada como fallback

### Risco Médio: Performance com Muitas Imagens
**Mitigação**:
- Implementar lazy loading
- Usar CSS sprites quando possível
- Limitar resolução máxima das imagens

### Risco Baixo: Compatibilidade de Navegadores
**Mitigação**:
- Detectar suporte a features avançadas
- Implementar fallbacks progressivos
- Documentar requisitos mínimos

---

## Critérios de Sucesso

### Funcionalidades Obrigatórias

#### **FEATURE 1: Índices Customizados**
- ✅ Definir N tipos de stickers (1 a 54+)
- ✅ Estado inicial personalizado do cubo
- ✅ Qualquer CSS como textura de sticker
- ✅ Rotação física correta dos stickers

#### **FEATURE 2: Texturas por Face**  
- ✅ 1 a 6 texturas diferentes por cubo
- ✅ Auto-sprite: divisão automática em grade 3x3
- ✅ Suporte universal: cor, gradiente, imagem, SVG, URL
- ✅ Rotação preserva integridade da textura

#### **COMUM**
- ✅ Interface dual (alternar entre modos)
- ✅ Presets para ambos os modos
- ✅ Export/import de configurações
- ✅ Compatibilidade total com algoritmos existentes

### Funcionalidades Desejáveis
- 🎯 **Picture Cube Automático**: Upload de imagem → divisão automática em 6 faces
- 🎯 **Gerador de Padrões**: Criar estados iniciais interessantes automaticamente
- 🎯 **Modo Híbrido**: Combinar índices customizados + texturas por face
- 🎯 **Animação de Montagem**: Mostrar como montar o picture cube real
- 🎯 **Export 3D**: Gerar modelo para impressão 3D do cubo customizado
- 🎯 **Solver Personalizado**: Resolver cubos com texturas customizadas

### Métricas de Performance
- Movimentos executados em < 50ms
- Carregamento inicial < 2s
- Uso de memória < 100MB
- Compatibilidade com Chrome 80+, Firefox 75+, Safari 13+

---

## Próximos Passos Imediatos

1. **Criar branch de desenvolvimento**: `git checkout -b feature/advanced-stickers`
2. **Backup do código atual**: Copiar `index.html` para `index_backup.html`
3. **Implementar Fase 1.1**: Começar com o novo modelo de dados
4. **Criar testes básicos**: Validar que movimentos simples ainda funcionam
5. **Documentar mudanças**: Manter log detalhado das modificações

---

*Este plano será atualizado conforme o progresso da implementação e descoberta de novos requisitos ou desafios técnicos.*