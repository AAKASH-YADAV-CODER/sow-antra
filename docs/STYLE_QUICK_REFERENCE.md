# MainPage Style Quick Reference

## 🎨 How to Use Styles in MainPage

### Import Statements
```jsx
// Add these imports at the top of MainPage.jsx
import styles from '../styles/MainPage.module.css';
import * as styleHelpers from '../utils/styleHelpers';
// or import specific functions:
import { getCanvasElementStyle, getTextElementStyle } from '../utils/styleHelpers';
```

---

## 📖 Quick Reference Table

| Use Case | Method | Example |
|----------|--------|---------|
| Static layout | Tailwind | `className="flex p-4"` |
| Custom animation | CSS Module | `className={styles.fadeIn}` |
| Dynamic position | Helper Function | `style={getCanvasElementStyle(...)}` |
| Combine multiple | All three | See below ⬇️ |

---

## 🔧 Common Patterns

### 1. Canvas Elements
```jsx
<div 
  className={`${styles.canvasElement} ${isSelected ? styles.selected : ''}`}
  style={styleHelpers.getCanvasElementStyle(element, zoomLevel)}
>
  {/* Content */}
</div>
```

### 2. Text Elements
```jsx
<div
  className={styles.textElement}
  style={styleHelpers.getTextElementStyle(element, currentFont)}
  contentEditable={isEditing}
>
  {element.text}
</div>
```

### 3. Selection Handles
```jsx
<div 
  className={styles.selectionBox}
  style={styleHelpers.getSelectionBoxStyle(element, zoomLevel)}
>
  <div className={`${styles.resizeHandle} ${styles.nw}`} />
  <div className={`${styles.resizeHandle} ${styles.ne}`} />
  {/* More handles */}
</div>
```

### 4. Modal Dialogs
```jsx
<div 
  className={`${styles.modalOverlay} ${showModal ? styles.fadeIn : ''}`}
  style={styleHelpers.getModalOverlayStyle(showModal)}
>
  <div className={styles.modalContent}>
    {/* Modal content */}
  </div>
</div>
```

### 5. Mobile Sidebar
```jsx
<div
  className="lg:block"
  style={isMobile ? styleHelpers.getMobileSidebarStyle(isOpen) : {}}
>
  {/* Sidebar content */}
</div>
```

### 6. Zoom Controls
```jsx
<div className={styles.zoomControls}>
  <button className={styles.zoomButton} onClick={() => zoom('out')}>
    <ZoomOut />
  </button>
  <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
  <button className={styles.zoomButton} onClick={() => zoom('in')}>
    <ZoomIn />
  </button>
</div>
```

### 7. Color Swatches
```jsx
{colors.map(color => (
  <div
    key={color}
    style={styleHelpers.getColorSwatchStyle(color, selectedColor === color)}
    onClick={() => setSelectedColor(color)}
  />
))}
```

### 8. Template Cards
```jsx
{templates.map(template => (
  <div
    key={template.id}
    className={styles.templateCard}
    style={styleHelpers.getTemplateCardStyle(selected === template.id)}
  >
    <img src={template.image} className={styles.templateImage} />
    <div className={styles.templateLabel}>{template.name}</div>
  </div>
))}
```

---

## 📐 Available CSS Classes

### Layout
- `styles.mainContainer`
- `styles.canvasContainer`
- `styles.canvasWrapper`
- `styles.sidebar`

### Elements
- `styles.canvasElement`
- `styles.textElement`
- `styles.imageElement`
- `styles.shapeElement`

### Selection
- `styles.selected`
- `styles.multiSelected`
- `styles.selectionBox`
- `styles.resizeHandle`
- `styles.rotateHandle`

### UI Components
- `styles.toolbar`
- `styles.toolButton`
- `styles.fab`
- `styles.modalOverlay`
- `styles.modalContent`

### Effects
- `styles.fadeIn`
- `styles.slideInUp`
- `styles.slideInDown`

### Utilities
- `styles.noSelect`
- `styles.hidden`
- `styles.loading`
- `styles.spinner`

---

## 🎯 Helper Functions

### Element Styles
```jsx
styleHelpers.getCanvasElementStyle(element, zoomLevel)
styleHelpers.getTextElementStyle(element, fontFamily)
styleHelpers.getShapeElementStyle(element)
styleHelpers.getImageElementStyle(element)
```

### UI Styles
```jsx
styleHelpers.getGradientString(gradient)
styleHelpers.getSelectionBoxStyle(element, zoomLevel)
styleHelpers.getZoomIndicatorStyle(show)
styleHelpers.getRecordingIndicatorStyle(isRecording)
```

### Layout Styles
```jsx
styleHelpers.getCanvasTransformStyle(zoomLevel, offset)
styleHelpers.getFABStyle(index, isMobile)
styleHelpers.getMobileSidebarStyle(isOpen)
styleHelpers.getModalOverlayStyle(isOpen)
```

### Interactive Styles
```jsx
styleHelpers.getColorSwatchStyle(color, isSelected)
styleHelpers.getTemplateCardStyle(isSelected)
styleHelpers.getEffectCardStyle(isActive)
```

---

## ⚡ Performance Tips

### 1. Memoize Style Calculations
```jsx
const elementStyle = useMemo(
  () => styleHelpers.getCanvasElementStyle(element, zoomLevel),
  [element.x, element.y, element.width, element.height, zoomLevel]
);
```

### 2. Combine Styles Efficiently
```jsx
const combinedStyle = useMemo(() => ({
  ...styleHelpers.getCanvasElementStyle(element, zoomLevel),
  ...additionalStyles
}), [element, zoomLevel, additionalStyles]);
```

### 3. Conditional Classes
```jsx
const className = classNames(
  styles.canvasElement,
  isSelected && styles.selected,
  isDragging && styles.dragging
);
```

---

## 🐛 Common Issues

### Issue: Styles not applying
**Solution**: Check import path and CSS module naming
```jsx
// ✅ Correct
import styles from '../styles/MainPage.module.css';

// ❌ Wrong
import styles from '../styles/MainPage.css';
```

### Issue: Helper function returns undefined
**Solution**: Check all required parameters
```jsx
// ✅ Correct
getCanvasElementStyle(element, zoomLevel)

// ❌ Wrong - missing zoomLevel
getCanvasElementStyle(element)
```

### Issue: Styles overwritten by Tailwind
**Solution**: Use `!important` in CSS Module or adjust specificity
```css
.myClass {
  color: red !important;
}
```

---

## 📱 Responsive Patterns

### Desktop + Mobile
```jsx
<div className={`
  hidden lg:flex
  ${styles.toolbar}
`}>
```

### Mobile-Specific Styles
```jsx
<div 
  className="lg:hidden"
  style={isMobile ? styleHelpers.getMobileSidebarStyle(isOpen) : {}}
>
```

### Touch-Optimized
```jsx
<button className={`
  ${styles.toolButton}
  touch-manipulation
  min-h-[44px] min-w-[44px]
`}>
```

---

## ✅ Checklist for New Styles

- [ ] Is it static? → Use CSS Module
- [ ] Is it dynamic? → Create helper function
- [ ] Is it a utility? → Use Tailwind
- [ ] Does it need animation? → CSS Module
- [ ] Does it depend on state? → Helper function
- [ ] Is it reusable? → Helper function + document here

---

**Quick Tip**: Press `Ctrl+F` to search for specific styles in this document!
