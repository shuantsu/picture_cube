# Cube Core - Isolated Cube Logic

## Overview
`cube-core.js` contains the isolated cube simulation logic, separated from UI and rendering code for easier testing and optimization.

## Structure

### CubeCore Class
- **State Management**: `cubeState`, `stickerRotations`, `stickerTextures`
- **Fundamental Moves**: `moveU()`, `rotationX()`, `rotationY()`, `rotationZ()`
- **Derived Moves**: All other moves built from fundamentals
- **Move Dispatcher**: `applyMove(move)` - executes any move by notation

## Usage in index.php

```javascript
// Initialize
const cubeCore = new CubeCore();

// Apply moves
cubeCore.applyMove('R');
cubeCore.applyMove("U'");
cubeCore.applyMove('R2');

// Sync state with UI
cubeState = cubeCore.cubeState;
stickerRotations = cubeCore.stickerRotations;
stickerTextures = cubeCore.stickerTextures;
updateDOM();
```

## Benefits

1. **Isolated Testing**: Test cube logic without UI
2. **Performance Benchmarks**: Measure move execution speed
3. **Easy Optimization**: Refactor core without breaking UI
4. **No Regression**: UI code unchanged, only uses core
5. **Maintainability**: Clear separation of concerns

## Benchmark Example

```javascript
// Test performance
const core = new CubeCore();
const start = performance.now();
for (let i = 0; i < 1000; i++) {
  core.applyMove('R');
  core.applyMove("U'");
  core.applyMove('R2');
}
const end = performance.now();
console.log(`1000 moves in ${end - start}ms`);
```

## Next Steps

1. Create benchmark suite
2. Profile bottlenecks
3. Optimize hot paths
4. Compare implementations
5. Ensure no regression
