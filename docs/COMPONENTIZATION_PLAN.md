# MainPage.jsx Component Breakdown Plan

## Overview
MainPage.jsx is currently **6,810 lines** - way too large for maintainability. This document outlines the component extraction strategy.

## ✅ Completed Components

### 1. **Toolbar.jsx** (89 lines)
- **Location**: `src/features/canvas/components/Toolbar.jsx`
- **Purpose**: Main tool selection (Select, Text, Shape, Image, Stickers)
- **Props**: `currentTool`, `onToolChange`
- **Status**: ✅ Created

### 2. **PropertiesPanel.jsx** (457 lines)
- **Location**: `src/features/canvas/components/PropertiesPanel.jsx`
- **Purpose**: Right sidebar for element properties, filters, animations, export options
- **Props**: `selectedElement`, `selectedElementData`, `animations`, `filterOptions`, `fontFamilies`, etc.
- **Key Features**:
  - Animation selection
  - Position & size controls
  - Rotation slider
  - Filter controls
  - Text properties (font, size, color, alignment)
  - Image properties (border radius)
  - Fill type (solid/gradient)
  - Action buttons (duplicate, lock, z-index)
  - Export options (PNG, JPEG, WebP, SVG, PDF)
- **Status**: ✅ Created

### 3. **LayersPanel.jsx** (58 lines)
- **Location**: `src/features/canvas/components/LayersPanel.jsx`
- **Purpose**: Page/layer management bar
- **Props**: `pages`, `currentPage`, `setCurrentPage`, `addNewPage`, `deleteCurrentPage`, `renameCurrentPage`
- **Status**: ✅ Created

### 4. **TopBar.jsx** (322 lines)
- **Location**: `src/features/canvas/components/TopBar.jsx`
- **Purpose**: Main application header with all controls
- **Props**: Extensive - includes undo/redo, save/load, zoom, recording, language, account
- **Key Features**:
  - File operations (Save, Load, Export)
  - History (Undo/Redo)
  - View controls (Zoom, Grid, Fit to Screen)
  - Animation & Recording controls
  - Templates & Effects panels toggle
  - Language selector with full menu
  - Account menu with logout
- **Status**: ✅ Created

## 📋 Remaining Work

### Next Steps for Full Componentization

#### 5. **LeftToolsPanel.jsx** (Not Created Yet)
- **Purpose**: Left sidebar with vertical tool icons
- **Extract From**: Lines ~5540-5620
- **Contains**: Select, Pan, Text, Rectangle, Circle, Triangle, Image buttons

#### 6. **FloatingToolbar.jsx** (Already Exists!)
- **Location**: `src/features/canvas/components/FloatingToolbar.jsx`
- **Status**: ✅ Already created in features/canvas/components/
- **No action needed**

#### 7. **CanvasArea.jsx** (Major Component)
- **Purpose**: Main canvas rendering area with all elements
- **Extract From**: Lines ~5750-6500
- **Contains**:
  - Canvas container with zoom/pan
  - All element rendering (text, shapes, images, stickers)
  - Selection handles
  - Grid overlay
  - Touch gesture handling
  - Element dragging/resizing logic

#### 8. **MobileBottomBar.jsx** (Not Created Yet)
- **Purpose**: Mobile-specific bottom toolbar
- **Extract From**: Lines ~6700-6750
- **Contains**: Mobile tools and properties drawers

#### 9. **Modal Components** (Some Already Exist)
- **SaveDialog.jsx** ✅ Already in `features/canvas/components/modals/`
- **TemplatesModal.jsx** ✅ Already in `features/canvas/components/modals/`
- **LanguageHelpModal.jsx** ✅ Already in `features/canvas/components/modals/`
- **CustomTemplateModal.jsx** ✅ Already in `features/canvas/components/modals/`
- **VideoSettings Modal** - Not extracted yet

#### 10. **EffectsPanel.jsx** ✅ Already Exists!
- **Location**: `src/features/canvas/components/EffectsPanel.jsx`
- **Status**: Already created
- **No action needed**

## 🎯 Integration Strategy

### Phase 1: Update MainPage.jsx Imports (Next Step)
```javascript
// Add these imports at the top of MainPage.jsx
import Toolbar from '../features/canvas/components/Toolbar';
import PropertiesPanel from '../features/canvas/components/PropertiesPanel';
import LayersPanel from '../features/canvas/components/LayersPanel';
import TopBar from '../features/canvas/components/TopBar';
```

### Phase 2: Replace JSX in MainPage.jsx
Replace the corresponding sections with:
```jsx
<TopBar
  undo={undo}
  redo={redo}
  saveProject={saveProject}
  // ... pass all required props
/>

<LayersPanel
  pages={pages}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  // ... other page management props
/>

<PropertiesPanel
  selectedElement={selectedElement}
  selectedElementData={selectedElementData}
  // ... all property management props
/>
```

### Phase 3: Keep in MainPage.jsx
MainPage.jsx should retain:
1. **All State Management** (useState declarations)
2. **All Event Handlers** (functions like addElement, updateElement, etc.)
3. **useEffect Hooks**
4. **Canvas Logic** (until CanvasArea.jsx is created)
5. **Helper Functions**

## 📊 Size Reduction Estimate

| Component | Lines Extracted | Status |
|-----------|----------------|--------|
| TopBar | ~350 lines | ✅ Done |
| Toolbar | ~100 lines | ✅ Done |
| PropertiesPanel | ~500 lines | ✅ Done |
| LayersPanel | ~60 lines | ✅ Done |
| LeftToolsPanel | ~100 lines | ⏳ Pending |
| CanvasArea | ~800 lines | ⏳ Pending |
| MobileBottomBar | ~100 lines | ⏳ Pending |
| **Total Reduction** | **~2,010 lines** | 50% ✅ |

**Current MainPage.jsx**: 6,810 lines  
**After Extraction**: ~4,800 lines (estimated)  
**Further reduction possible**: Extract CanvasArea → ~4,000 lines

## 🔧 Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other projects
3. **Testing**: Easier to write unit tests for isolated components
4. **Performance**: Potential for React.memo() optimization
5. **Collaboration**: Multiple developers can work on different components
6. **Debugging**: Easier to locate and fix bugs

## ⚠️ Important Notes

### Dependencies to Watch
- **GradientPicker**: Already exists in `features/canvas/components/`
- **MobileDrawers**: Already exists in `features/canvas/components/`
- **RecordingStatus**: Already exists in `features/canvas/components/`
- **VideoSettings**: Already exists in `features/canvas/components/`
- **SelectionHandles**: Already exists in `features/canvas/components/`

### Props Drilling Concern
With this many components, consider:
1. **Context API**: Create a `CanvasContext` to avoid prop drilling
2. **Custom Hooks**: Move logic to `useCanvas`, `useElements` (already exist!)
3. **State Management**: Consider Zustand or Redux if complexity grows

## 🚀 Next Immediate Steps

1. ✅ **DONE**: Create Toolbar.jsx
2. ✅ **DONE**: Create PropertiesPanel.jsx
3. ✅ **DONE**: Create LayersPanel.jsx
4. ✅ **DONE**: Create TopBar.jsx
5. **TODO**: Import these components in MainPage.jsx
6. **TODO**: Replace corresponding JSX sections
7. **TODO**: Test all functionality
8. **TODO**: Fix any broken prop connections
9. **TODO**: Extract remaining components (LeftToolsPanel, CanvasArea)
10. **TODO**: Create CanvasContext if needed

## 📝 Code Quality Improvements

While refactoring, also consider:
- [ ] Remove unused state variables
- [ ] Consolidate duplicate functions
- [ ] Add PropTypes or TypeScript
- [ ] Improve error boundaries
- [ ] Add loading states
- [ ] Optimize re-renders with React.memo()
- [ ] Extract inline styles to CSS modules (already partially done)
- [ ] Add JSDoc comments (partially done in new components)

## 🎓 Learning Resources

For team members working on this refactoring:
- React Component Composition: https://react.dev/learn/passing-props-to-a-component
- Context API: https://react.dev/learn/passing-data-deeply-with-context
- Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks

---

**Last Updated**: November 5, 2025  
**Status**: 50% Complete (4 of 8 main components created)  
**Ready for Integration**: Yes, can start replacing JSX in MainPage.jsx
