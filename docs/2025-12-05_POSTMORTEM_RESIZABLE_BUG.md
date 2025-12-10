# Postmortem: jQuery UI Resizable Bug

## O Problema

jQuery UI resizable parou de funcionar após commit `7c31693`. Os handles existiam no DOM (8 elementos visíveis no DevTools) mas não funcionavam. Apenas draggable continuava funcionando.

## Sintomas

- Handles apareciam como "L rotacionado 90° horário" abaixo da janela
- Todos os handles tinham `top`, `right`, `bottom`, `left` vazios (sem posicionamento inline)
- jQuery UI não estava aplicando estilos de posicionamento nos handles
- Draggable funcionava perfeitamente

## A Causa Raiz

**Um único import CSS foi removido acidentalmente:**

```javascript
// ANTES (funcionava)
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui.min.css';  // ← CSS do jQuery UI

// DEPOIS (quebrado)
import $ from 'jquery';
// CSS removido!
```

O CSS do jQuery UI contém as regras de posicionamento para os handles (`.ui-resizable-n`, `.ui-resizable-e`, etc.). Sem ele, os handles eram criados no DOM mas não tinham posicionamento.

## O Processo de Debug

### 1. Investigação Inicial
- Verificamos que handles existiam no DOM (8 elementos)
- Confirmamos que draggable funcionava
- Suspeitamos de CSS, pointer-events, z-index

### 2. Teorias Testadas (Todas Erradas)
- **Teoria 1**: CSS forçando handles para esquerda → Testamos posicionamento, não era isso
- **Teoria 2**: `#cube-3d-content` empurrando handles → Não era isso
- **Teoria 3**: jQuery UI não inicializando → Handles existiam, então estava inicializando
- **Teoria 4**: `position: absolute !important` bloqueando → Removemos, não resolveu
- **Teoria 5**: `overflow: hidden` cortando handles → Piorou a situação
- **Teoria 6**: `#cube-3d-content` bloqueando com pointer-events → Não resolveu

### 3. Mudança de Estratégia: Git Bisect Manual
Ao invés de continuar testando teorias CSS/JS, voltamos aos commits:
- `472a402` ✅ Funcionava
- `939d22b` ✅ Funcionava  
- `7fb40fe` ✅ Funcionava
- `7c31693` ❌ Quebrou

### 4. Análise do Diff
```bash
git diff 7fb40fe 7c31693 -- src/js/app.js
```

Encontramos a linha removida:
```diff
-import 'jquery-ui-dist/jquery-ui.min.css';
```

## A Solução

Restaurar o import:
```javascript
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui.min.css';
```

Bonus: Desabilitar rotação da câmera durante resize:
```javascript
win.resizable({
  start: function() {
    if (window.viewController) window.viewController.cameraRotationEnabled = false;
  }
});
```

## Lições Aprendidas

### 1. Sintomas Enganosos
Os handles existiam no DOM e tinham classes corretas, sugerindo que jQuery UI estava funcionando. Na verdade, faltava apenas o CSS.

### 2. Git Bisect é Poderoso
Após 6 teorias erradas, git bisect manual encontrou o problema em minutos. Quando não souber a causa, volte no histórico.

### 3. Imports de CSS São Críticos
CSS de bibliotecas não é "apenas visual" - pode conter lógica de posicionamento essencial. Tratar imports de CSS com o mesmo cuidado que imports de JS.

### 4. Debugging Metodológico
O processo teoria → previsão → teste funcionou bem, mas precisávamos ter mudado de estratégia mais cedo quando múltiplas teorias falharam.

## Como Evitar

### 1. Testes Automatizados
```javascript
// Teste que verifica se handles têm posicionamento
test('resizable handles should have positioning', () => {
  const handle = $('.ui-resizable-e');
  expect(handle.css('right')).toBe('0px');
});
```

### 2. Checklist de Imports Críticos
Documentar imports essenciais que não devem ser removidos:
```javascript
// CRITICAL: Required for jQuery UI positioning
import 'jquery-ui-dist/jquery-ui.min.css';
```

### 3. Visual Regression Testing
Screenshots automatizados detectariam handles mal posicionados.

### 4. Git Bisect Mais Cedo
Quando 2-3 teorias falharem consecutivamente, usar git bisect ao invés de continuar testando teorias.

### 5. Dependency Audit
Ao remover/mover imports, verificar se são usados por funcionalidades existentes:
```bash
# Buscar referências antes de remover
git grep "ui-resizable"
git grep "jquery-ui"
```

## Commit da Correção

```
🐛 fix: restore jQuery UI resizable functionality
- Add missing jquery-ui CSS import that was accidentally removed
- Disable camera rotation during window resize
- Add dragging/resizing classes for pointer-events control
```

Commit: `76fc725`

## Tempo Total

- Debug: ~2 horas (múltiplas teorias erradas)
- Git bisect: ~5 minutos (encontrou o commit)
- Análise do diff: ~2 minutos (encontrou a linha)
- Fix: ~1 minuto

**Lição**: Git bisect poderia ter economizado ~1h50min.
