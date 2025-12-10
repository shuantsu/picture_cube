# Insights - Sistema de Rotação de Stickers

## Problema Identificado

O cubo mágico é uma projeção de textura 2D de um cubo desdobrado (6 faces 3x3) em um cubo 3D. Por causa da projeção 3D, precisamos fazer ajustes manuais de rotação.

## Como Funciona o Sistema de Rotação

### Rotações por Face
- Cada movimento incrementa a rotação dos 9 stickers da própria face
- `rotateFaceStickers(face, clockwise)` incrementa/decrementa o array `stickerRotations[face]`
- Valores: 0-3 (mod 4), onde cada unidade = 90 graus

### Movimentos Especiais (F e B)

**Por que F e B são diferentes de R, L, U, D?**
- F e B incrementam stickers adjacentes, mas R, L, U, D não
- Motivo: Ajustes de orientação visual para compensar a projeção 2D→3D
- B usa +3 (equivalente a -1) porque a face B está "virada" em relação à F na projeção 3D

**Código do movimento F:**
```javascript
rotateFaceStickers('F', true);  // Incrementa os 9 da face F
[['U',6], ['U',7], ['U',8], ['L',8], ['L',5], ['L',2], 
 ['D',0], ['D',1], ['D',2], ['R',6], ['R',3], ['R',0]].forEach(([face, index]) => {
  stickerRotations[face][index] = (stickerRotations[face][index] + 1) % 4;
});
```

**Código do movimento B:**
```javascript
rotateFaceStickers('B', true);  // Incrementa os 9 da face B
[['U',0], ['U',1], ['U',2], ['R',2], ['R',5], ['R',8], 
 ['D',8], ['D',7], ['D',6], ['L',0], ['L',3], ['L',6]].forEach(([face, index]) => {
  stickerRotations[face][index] = (stickerRotations[face][index] + 3) % 4;  // +3 = -1
});
```

### Movimentos R, L, U, D

Estes movimentos:
- Apenas rotacionam os 9 stickers da própria face
- NÃO incrementam stickers adjacentes
- Transferem valores de rotação ao mover stickers entre faces (ex: R e L)
- U não transfere rotações porque os stickers mantêm orientação ao circular horizontalmente

### Transferência de Rotações

**Movimento R (transfere rotações):**
```javascript
// Salva rotações temporárias
const tempRot = [stickerRotations.F[2], stickerRotations.F[5], stickerRotations.F[8]];

// Move e ajusta rotações (+2 para compensar orientação)
stickerRotations.D[2] = (stickerRotations.B[6] + 2) % 4;
```

**Movimento U (NÃO transfere rotações):**
```javascript
// Apenas move cubeState, não ajusta stickerRotations
cubeState.F[0] = cubeState.R[0];
// stickerRotations não é copiado
```

## Problema Atual: Aplicação CSS

### Teoria
As rotações estão todas corretas no array `stickerRotations`, mas o problema está na aplicação do CSS.

### Código Problemático

**applyStickerToElement (aplica rotação 2D):**
```javascript
let totalRotation = 0;
if (face && index !== undefined && stickerRotations[face] && stickerRotations[face][index]) {
  totalRotation += stickerRotations[face][index] * 90;
}

if (totalRotation !== 0) {
  element.style.transform = `rotate(${totalRotation}deg)`;  // Rotação 2D
}
```

**update3DView (copia transform para 3D):**
```javascript
face3D.children[i].style.transform = sticker.style.transform;  // PROBLEMA!
```

### Problema Identificado
- A rotação CSS 2D (`rotate()`) está sendo aplicada diretamente no contexto 3D
- Isso pode **sobrescrever ou conflitar** com transformações 3D necessárias
- `transform` 2D não funciona igual no contexto 3D (precisa de `rotateZ()` no espaço 3D)

## Próximos Passos

1. Modificar `update3DView()` para aplicar rotação 3D correta (`rotateZ()`)
2. Verificar se há conflitos com outras transformações 3D
3. Testar se as rotações visuais ficam corretas após a correção

## Rotações x, y, z (WIP)
- Ignorar por enquanto, ainda em desenvolvimento
