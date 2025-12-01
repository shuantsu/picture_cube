# Unified Texture System - Extreme Test Cases

## Test Suite Overview

These tests push the unified system to its limits to validate behavior and identify edge cases.

---

## ✅ Test 1: Basic Functionality
**File:** `test-unified-basic.json`

**What it tests:**
- Face-level texture assignment
- Single sticker overlay with array syntax
- SVG data URL support

**Expected behavior:**
- U face: solid red
- U1 sticker: red base + gold star overlay

**Validation:**
- [ ] U face renders red
- [ ] U1 shows star on red background
- [ ] Star is centered and sized correctly
- [ ] Other U stickers inherit face color

---

## ⚠️ Test 2: Triple Layer Attempt
**File:** `test-unified-triple-layer.json`

**What it tests:**
- System limitation: only 2 layers supported
- Multiple overlay handling

**Expected behavior:**
- Should only apply 2 layers (base + overlay1)
- overlay2 should be ignored OR cause error

**Validation:**
- [ ] U4 shows base + circle overlay
- [ ] No third layer applied
- [ ] No console errors (graceful handling)

---

## 🌟 Test 3: Wildcard Selector
**File:** `test-unified-wildcard.json`

**What it tests:**
- `"*"` wildcard for all stickers
- Specific override priority

**Expected behavior:**
- All stickers: gray (#888888)
- U4 center: gold (#ffd700)

**Validation:**
- [ ] All 54 stickers are gray
- [ ] U4 is gold (override works)
- [ ] Wildcard applies to all faces

---

## 🧬 Test 4: Inheritance Logic
**File:** `test-unified-inheritance.json`

**What it tests:**
- Automatic inheritance when face texture exists
- Single value on sticker should inherit face base

**Expected behavior:**
- U face: red
- U1: red base (inherited) + star overlay

**Code says:**
```javascript
if (stickerAssignment) {
  if (Array.isArray(stickerAssignment)) {
    finalAssignment = stickerAssignment;
  } else if (faceAssignment) {
    // Inheritance: face + sticker overlay
    finalAssignment = [faceAssignment, stickerAssignment];
  }
}
```

**Validation:**
- [ ] U1 has red background
- [ ] U1 has star overlay
- [ ] Inheritance works automatically

---

## ❌ Test 5: Missing Texture Reference
**File:** `test-unified-missing-texture.json`

**What it tests:**
- Error handling for non-existent texture names
- Fallback behavior

**Expected behavior:**
- U face: should fail gracefully or show nothing
- L face: red (valid reference)

**Validation:**
- [ ] No crash/alert
- [ ] U face shows fallback or nothing
- [ ] L face renders correctly
- [ ] Console shows warning (optional)

---

## 🎯 Test 6: All 9 Stickers
**File:** `test-unified-all-stickers.json`

**What it tests:**
- Performance with all stickers customized
- Redundant face assignment (U is defined but all stickers override)

**Expected behavior:**
- All 9 U stickers: red + star

**Validation:**
- [ ] All 9 stickers render identically
- [ ] No performance issues
- [ ] Stars are properly centered

---

## 🎨 Test 7: All 6 Faces
**File:** `test-unified-all-faces.json`

**What it tests:**
- Complete cube configuration
- Standard color scheme

**Expected behavior:**
- Standard Rubik's cube colors on all faces

**Validation:**
- [ ] All 6 faces have correct colors
- [ ] Colors persist after moves (R U R' U')
- [ ] No texture bleeding between faces

---

## 🔧 Test 8: Inline Textures
**File:** `test-unified-inline-textures.json`

**What it tests:**
- Direct color values without texture library
- Empty texture library handling

**Expected behavior:**
- Colors applied directly from cube assignments
- No texture library lookup needed

**Validation:**
- [ ] All faces render with correct colors
- [ ] System handles empty textures object
- [ ] Inline values work as expected

---

## 🌈 Test 9: Complex CSS Objects
**File:** `test-unified-complex-objects.json`

**What it tests:**
- Linear gradients
- Radial gradients
- Conic gradients
- Inline object assignment (F face)

**Expected behavior:**
- U: diagonal gradient (red to orange)
- L: radial gradient (white center to blue edge)
- F: rainbow conic gradient

**Validation:**
- [ ] All gradients render correctly
- [ ] Inline object on F face works
- [ ] Gradients rotate with stickers

---

## 🧩 Test 10: No Face Base
**File:** `test-unified-no-face-base.json`

**What it tests:**
- Individual sticker assignment without face-level texture
- Checkerboard pattern

**Expected behavior:**
- U face: 3x3 grid of red/blue/green pattern
- Other faces: default/nothing

**Validation:**
- [ ] Individual stickers render correctly
- [ ] No face-level texture needed
- [ ] Pattern is clear and distinct

---

## 🔍 Critical Questions to Answer

1. **Does wildcard (`*`) actually work?** (Code references it but no examples use it)

2. **What happens with missing texture references?** (Does `resolveTexture` return the string or undefined?)

3. **Does inheritance work as documented?** (Single value + face assignment = auto-array)

4. **Can you use inline objects in cube assignments?** (Test 9 tries this)

5. **What's the priority order?**
   - Sticker array assignment
   - Sticker single + face inheritance
   - Face assignment
   - Wildcard
   - Nothing (default gray?)

6. **Do textures follow stickers during moves?** (Critical for supercube functionality)

---

## 🎯 How to Test

1. Load each JSON file via "Custom Textures" textarea
2. Click "Apply Textures"
3. Verify visual output matches expected behavior
4. Execute moves: `R U R' U'` to test persistence
5. Check browser console for errors
6. Document actual behavior vs expected

---

## 📊 Expected Results Summary

| Test | Should Work | Might Fail | Critical |
|------|-------------|------------|----------|
| 1. Basic | ✅ | - | ⭐⭐⭐ |
| 2. Triple Layer | ⚠️ | Might apply all 3 | ⭐ |
| 3. Wildcard | ❓ | Not tested in code | ⭐⭐ |
| 4. Inheritance | ✅ | Logic exists | ⭐⭐⭐ |
| 5. Missing Ref | ⚠️ | Might show string | ⭐⭐ |
| 6. All Stickers | ✅ | - | ⭐ |
| 7. All Faces | ✅ | - | ⭐⭐⭐ |
| 8. Inline | ✅ | - | ⭐⭐ |
| 9. Complex CSS | ✅ | - | ⭐⭐ |
| 10. No Face Base | ✅ | - | ⭐⭐ |

---

## 🐛 Potential Bugs to Watch For

1. **Texture not following stickers** - If textures don't move with stickers during cube moves
2. **Wildcard not working** - Code references it but might not be fully implemented
3. **Missing texture shows literal string** - "nonexistent" appears as text
4. **Inheritance not triggering** - Single value doesn't auto-create array
5. **Inline objects ignored** - System might only accept string references
6. **Performance issues** - All 54 stickers with overlays might be slow
7. **Layer order wrong** - Overlay appears under base instead of over

---

## 🚀 Next Steps

Run these tests and document:
- ✅ What works perfectly
- ⚠️ What works but has quirks
- ❌ What fails completely
- 💡 What could be improved
