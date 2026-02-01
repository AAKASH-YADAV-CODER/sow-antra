# Component Architecture Diagram

## 📐 Visual Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                            MainPage.jsx                              │
│                     (State Management Hub)                           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                         TopBar.jsx                          │   │
│  │  [Logo] [Undo/Redo] [Save/Load] [Zoom] [Language] [User]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                       LayersPanel.jsx                       │   │
│  │        [Page 1] [Page 2] [+ Add] [Delete] [Rename]        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────┬────────────────────────────────────────────┬──────────┐ │
│  │      │                                            │          │ │
│  │ Left │              Canvas Area                   │  Props   │ │
│  │Tools │                                            │  Panel   │ │
│  │Panel │  ┌──────────────────────────────────┐    │          │ │
│  │      │  │                                   │    │ ┌──────┐ │ │
│  │ [⚪]  │  │   📝 Text Elements                │    │ │Props │ │ │
│  │ [✋]  │  │   🔲 Shape Elements               │    │ │      │ │ │
│  │ [T]  │  │   🖼️  Image Elements               │    │ │  •X  │ │ │
│  │ [▢]  │  │   ✨ Stickers                     │    │ │  •Y  │ │ │
│  │ [●]  │  │   📐 Selection Handles            │    │ │  •W  │ │ │
│  │ [▲]  │  │   🎯 Grid Overlay                 │    │ │  •H  │ │ │
│  │ [🖼️]  │  │                                   │    │ │      │ │ │
│  │      │  │   [FloatingToolbar]               │    │ │Anim. │ │ │
│  │      │  │                                   │    │ │      │ │ │
│  │      │  └──────────────────────────────────┘    │ │Filt. │ │ │
│  │      │                                            │ │      │ │ │
│  │      │  [MobileDrawers] (Mobile Only)            │ │Fill  │ │ │
│  │      │                                            │ │      │ │ │
│  └──────┴────────────────────────────────────────────┴──────────┘ │
│                                                                      │
│  [Modals Layer]                                                     │
│  • SaveDialog.jsx                                                   │
│  • TemplatesModal.jsx                                               │
│  • LanguageHelpModal.jsx                                            │
│  • CustomTemplateModal.jsx                                          │
│  • EffectsPanel.jsx                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🧩 Component Hierarchy

```
MainPage.jsx (Root Container)
├── TopBar.jsx ✅
│   ├── Logo & Title
│   ├── Action Buttons (Undo/Redo/Save/Load)
│   ├── Zoom Controls
│   ├── Animation Controls
│   ├── Recording Status
│   ├── Language Selector
│   └── Account Menu
│
├── LayersPanel.jsx ✅
│   ├── Page Tabs
│   ├── Add Page Button
│   ├── Delete Page Button
│   └── Rename Page Button
│
├── Main Content Area
│   │
│   ├── LeftToolsPanel (TODO)
│   │   ├── Select Tool
│   │   ├── Pan Tool
│   │   ├── Text Tool
│   │   ├── Shape Tools
│   │   └── Image Tool
│   │
│   ├── Canvas Container (TODO - Extract from MainPage)
│   │   ├── Canvas Element
│   │   ├── Grid Overlay
│   │   ├── Element Renderers
│   │   │   ├── Text Elements
│   │   │   ├── Shape Elements
│   │   │   ├── Image Elements
│   │   │   └── Sticker Elements
│   │   ├── Selection System
│   │   │   ├── Selection Box
│   │   │   ├── SelectionHandles.jsx ✅
│   │   │   └── Resize/Rotate Handles
│   │   ├── FloatingToolbar.jsx ✅
│   │   └── Touch Gesture Handlers
│   │
│   └── PropertiesPanel.jsx ✅
│       ├── Animation Selector
│       ├── Effects Quick Access
│       ├── Position Controls (X, Y)
│       ├── Size Controls (W, H)
│       ├── Rotation Slider
│       ├── Filter Controls
│       ├── Type-Specific Properties
│       │   ├── Text Properties
│       │   ├── Shape Properties
│       │   ├── Image Properties
│       │   └── Sticker Properties
│       ├── Action Buttons
│       │   ├── Duplicate
│       │   ├── Lock/Unlock
│       │   ├── Z-Index Controls
│       │   └── Delete
│       ├── Export Section
│       │   ├── PNG/JPEG/WebP/SVG
│       │   └── PDF Export
│       └── Save Project Button
│
├── Mobile Components
│   ├── MobileDrawers.jsx ✅
│   │   ├── Tools Drawer
│   │   └── Properties Drawer
│   └── MobileBottomBar (TODO)
│       ├── Tools Button
│       └── Properties Button
│
└── Modal Components
    ├── SaveDialog.jsx ✅
    ├── TemplatesModal.jsx ✅
    ├── LanguageHelpModal.jsx ✅
    ├── CustomTemplateModal.jsx ✅
    ├── EffectsPanel.jsx ✅
    └── VideoSettings (TODO - Extract from MainPage)
```

## 🔄 Data Flow

```
User Interaction
     ↓
TopBar / Toolbar / PropertiesPanel
     ↓
Event Handler (in MainPage.jsx)
     ↓
State Update (useState in MainPage.jsx)
     ↓
Props to Child Components
     ↓
Re-render with New State
```

## 📊 Props Flow Diagram

```
MainPage.jsx (State Container)
│
├─→ TopBar.jsx
│   • zoomLevel, showGrid, recording, currentLanguage
│   • setZoomLevel, setShowGrid, startRecording
│   • undo, redo, saveProject, loadProject
│
├─→ LayersPanel.jsx
│   • pages[], currentPage
│   • setCurrentPage, addNewPage, deleteCurrentPage
│
├─→ PropertiesPanel.jsx
│   • selectedElement, selectedElementData
│   • animations, filterOptions, fontFamilies
│   • updateElement, updateFilter, duplicateElement
│   • exportAsImage, exportAsPDF
│
└─→ Canvas Area (Still in MainPage.jsx)
    • elements[], zoomLevel, showGrid
    • selectedElement, lockedElements
    • Event handlers: onClick, onDrag, onResize
```

## 🎯 Component Responsibilities

### MainPage.jsx (State Manager)
- ✅ Maintains all application state
- ✅ Defines all event handler functions
- ✅ Coordinates between components
- ⏳ Renders canvas elements (to be extracted)
- ✅ Manages history (undo/redo)
- ✅ Handles touch gestures
- ✅ Manages recording state

### TopBar.jsx (Application Controls)
- ✅ File operations UI
- ✅ View controls UI
- ✅ Recording controls UI
- ✅ Language selection UI
- ✅ User account menu UI
- ❌ No state management (receives via props)

### PropertiesPanel.jsx (Element Editor)
- ✅ Display selected element properties
- ✅ Provide controls for editing properties
- ✅ Show animation & filter options
- ✅ Export functionality UI
- ❌ No direct state manipulation (calls props functions)

### LayersPanel.jsx (Page Manager)
- ✅ Display all pages
- ✅ Page navigation UI
- ✅ Page CRUD operations UI
- ❌ No page data storage (receives via props)

## 📦 Shared Dependencies

All components share:
- `react-i18next` for translations
- `lucide-react` for icons
- Tailwind CSS for styling
- MainPage.module.css for specific styles

## 🔌 Context API Opportunity

If prop drilling becomes too complex, consider:

```
CanvasContext
├── State
│   ├── elements
│   ├── selectedElement
│   ├── zoomLevel
│   ├── pages
│   └── ...
└── Actions
    ├── updateElement
    ├── addElement
    ├── deleteElement
    └── ...
```

This would eliminate passing props through multiple levels.

## 📈 Before vs After

### Before (Original MainPage.jsx)
```
MainPage.jsx: 6,810 lines
├── All UI code
├── All state management
├── All event handlers
├── All rendering logic
└── All styles
```

### After (Componentized)
```
MainPage.jsx: ~4,000 lines (estimated)
├── State management only
├── Event handlers
└── Coordination logic

+ TopBar.jsx: 322 lines
+ PropertiesPanel.jsx: 457 lines
+ LayersPanel.jsx: 58 lines
+ Toolbar.jsx: 89 lines
+ (Future) CanvasArea.jsx: ~800 lines
+ (Future) LeftToolsPanel.jsx: ~100 lines
───────────────────────────────────
Total: ~5,826 lines (more maintainable!)
```

## 🎨 Benefits Visualization

```
Monolithic Approach:
[=========================] 6,810 lines - Hard to navigate
                                          Hard to test
                                          Hard to debug

Component Approach:
[===] TopBar (322)        - Easy to understand
[====] Props (457)        - Easy to test
[=] Layers (58)           - Easy to debug
[==] Toolbar (89)         - Easy to modify
[======] Canvas (800)     - Easy to reuse
[====================] MainPage (4,000) - Focused on logic
```

## 🚦 Integration Status

| Component | Status | Lines | Integrated |
|-----------|--------|-------|------------|
| TopBar | ✅ Created | 322 | ⏳ Pending |
| PropertiesPanel | ✅ Created | 457 | ⏳ Pending |
| LayersPanel | ✅ Created | 58 | ⏳ Pending |
| Toolbar | ✅ Created | 89 | ⏳ Pending |
| LeftToolsPanel | ⏳ TODO | ~100 | ❌ No |
| CanvasArea | ⏳ TODO | ~800 | ❌ No |
| MobileBottomBar | ⏳ TODO | ~100 | ❌ No |
| **Total** | **50% Done** | **~1,926** | **0%** |

## 📝 Next Actions

1. **Backup MainPage.jsx**
   ```bash
   cp src/pages/MainPage.jsx src/pages/MainPage.backup.jsx
   ```

2. **Add imports** to MainPage.jsx

3. **Replace JSX sections** one at a time

4. **Test after each replacement**

5. **Fix any prop mismatches**

6. **Commit when stable**

7. **Continue with remaining components**

---

**Last Updated**: November 5, 2025  
**Complexity**: Medium  
**Estimated Time**: 2-3 hours for integration  
**Risk**: Low (can easily revert from backup)
