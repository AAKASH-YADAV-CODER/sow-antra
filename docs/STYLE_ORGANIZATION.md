# Style Organization Guide for MainPage

## Overview
The styling for MainPage.jsx has been refactored into separate, maintainable files to improve code cleanliness and organization.

---

## 📁 File Structure

```
src/
├── styles/
│   └── MainPage.module.css          # Static CSS styles (CSS Modules)
├── utils/
│   └── styleHelpers.js              # Dynamic style functions
└── pages/
    └── MainPage.jsx                 # Component (uses Tailwind + above)
```

---

## 🎨 Style Architecture

### 1. **Tailwind Classes** (Keep in JSX)
Used for: Responsive layouts, spacing, colors, basic styling

```jsx
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">
  {/* Content */}
</div>
```

**Why**: Tailwind's utility classes are perfect for responsive design and quick styling.

---

### 2. **CSS Modules** (`MainPage.module.css`)
Used for: Static custom styles, animations, complex selectors

```jsx
import styles from '../styles/MainPage.module.css';

<div className={styles.canvasElement}>
  {/* Content */}
</div>
```

**Includes**:
- ✅ Canvas element styles
- ✅ Selection handles & resize handles
- ✅ Grid overlay
- ✅ Alignment lines
- ✅ Animations (fadeIn, slideInUp, etc.)
- ✅ Custom scrollbars
- ✅ Print styles
- ✅ Accessibility styles

**Benefits**:
- Scoped styles (no naming conflicts)
- Better organization
- Easier to maintain
- Can be unit tested

---

### 3. **Style Helper Functions** (`utils/styleHelpers.js`)
Used for: Dynamic inline styles that depend on state/props

```jsx
import { getCanvasElementStyle, getTextElementStyle } from '../utils/styleHelpers';

<div style={getCanvasElementStyle(element, zoomLevel)}>
  {/* Content */}
</div>
```

**Available Functions**:

#### Element Styles
- `getCanvasElementStyle(element, zoomLevel)` - Base element positioning
- `getTextElementStyle(element, fontFamily)` - Text-specific styles
- `getShapeElementStyle(element)` - Shape element styles
- `getImageElementStyle(element)` - Image element styles

#### UI Components
- `getGradientString(gradient)` - Generate CSS gradient strings
- `getSelectionBoxStyle(element, zoomLevel)` - Selection box positioning
- `getAlignmentLineStyle(line)` - Alignment guide lines
- `getZoomIndicatorStyle(show)` - Zoom level indicator
- `getRecordingIndicatorStyle(isRecording)` - Recording status

#### Layout & Position
- `getCanvasTransformStyle(zoomLevel, offset)` - Canvas zoom/pan
- `getFABStyle(index, isMobile)` - Floating action buttons
- `getMobileSidebarStyle(isOpen)` - Mobile sidebar animation
- `getModalOverlayStyle(isOpen)` - Modal backdrop

#### Interaction
- `getColorSwatchStyle(color, isSelected)` - Color picker swatches
- `getTemplateCardStyle(isSelected)` - Template selection cards
- `getEffectCardStyle(isActive)` - Effect selection cards
- `getGridBackgroundStyle(gridSize, show)` - Canvas grid overlay

**Benefits**:
- Reusable across components
- Easy to test
- Clear function names
- Type-safe (can add JSDoc/TypeScript)
- Reduces inline style clutter

---

## 🔧 Usage Examples

### Example 1: Canvas Element with Dynamic Position

**Before** (Inline style):
```jsx
<div 
  style={{
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
  }}
>
```

**After** (Helper function):
```jsx
import { getCanvasElementStyle } from '../utils/styleHelpers';

<div style={getCanvasElementStyle(element, zoomLevel)}>
```

---

### Example 2: Selection Box with CSS Module

**Before**:
```jsx
<div 
  style={{
    position: 'absolute',
    border: '2px solid #3b82f6',
    pointerEvents: 'none',
    ...
  }}
>
```

**After**:
```jsx
import styles from '../styles/MainPage.module.css';

<div className={styles.selectionBox}>
```

---

### Example 3: Text Element (Combined Approach)

```jsx
import styles from '../styles/MainPage.module.css';
import { getTextElementStyle } from '../utils/styleHelpers';

<div 
  className={`${styles.textElement} ${isSelected ? styles.selected : ''}`}
  style={getTextElementStyle(element, currentFont)}
>
  {element.text}
</div>
```

---

## 📋 Migration Checklist

When refactoring a component to use this system:

### ✅ Step 1: Identify Style Types
- [ ] Static styles → Move to CSS Module
- [ ] Dynamic styles → Create helper function
- [ ] Simple utility styles → Keep as Tailwind

### ✅ Step 2: Extract to CSS Module
```css
/* In MainPage.module.css */
.myComponent {
  display: flex;
  align-items: center;
  /* ... */
}
```

### ✅ Step 3: Create Helper Functions
```javascript
// In styleHelpers.js
export const getMyComponentStyle = (props) => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
});
```

### ✅ Step 4: Update Component
```jsx
import styles from '../styles/MainPage.module.css';
import { getMyComponentStyle } from '../utils/styleHelpers';

<div 
  className={styles.myComponent}
  style={getMyComponentStyle(props)}
>
```

---

## 🎯 Best Practices

### 1. **Use the Right Tool**
```
Tailwind → Simple utilities (flex, p-4, bg-white)
CSS Module → Static custom styles (animations, ::before)
Helper Functions → Dynamic calculations (positions, transforms)
```

### 2. **Keep Helpers Pure**
```javascript
// ✅ Good: Pure function
export const getStyle = (element) => ({ ... });

// ❌ Bad: Side effects
export const getStyle = (element) => {
  element.x = 0; // Don't mutate!
  return { ... };
};
```

### 3. **Name Clearly**
```javascript
// ✅ Good
getCanvasElementStyle()
getTextElementStyle()

// ❌ Bad
getStyle()
helper1()
```

### 4. **Document with JSDoc**
```javascript
/**
 * Get canvas element positioning styles
 * @param {Object} element - Element data
 * @param {number} zoomLevel - Current zoom level
 * @returns {Object} Style object
 */
export const getCanvasElementStyle = (element, zoomLevel) => { ... };
```

---

## 🚀 Performance Benefits

### Before Refactoring:
- ❌ 100+ inline style objects created on every render
- ❌ Hard to optimize with React.memo
- ❌ Difficult to track style changes

### After Refactoring:
- ✅ Helper functions can be memoized
- ✅ CSS Modules are optimized at build time
- ✅ Easier to identify performance bottlenecks
- ✅ Better code splitting

---

## 🧪 Testing

### Testing CSS Modules
```javascript
import styles from '../styles/MainPage.module.css';

test('has correct class names', () => {
  expect(styles.canvasElement).toBeDefined();
});
```

### Testing Style Helpers
```javascript
import { getCanvasElementStyle } from '../utils/styleHelpers';

test('returns correct position', () => {
  const element = { x: 100, y: 200, width: 50, height: 50 };
  const style = getCanvasElementStyle(element);
  
  expect(style.left).toBe('100px');
  expect(style.top).toBe('200px');
});
```

---

## 📚 Additional Resources

### CSS Modules
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Create React App - CSS Modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)

### Tailwind CSS
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind with React](https://tailwindcss.com/docs/guides/create-react-app)

### Style Performance
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [CSS Optimization](https://web.dev/css-performance/)

---

## 🔄 Future Improvements

### Phase 2 (Optional):
1. Add TypeScript types to styleHelpers
2. Create more specialized helper functions
3. Extract component-specific styles to separate CSS modules
4. Add CSS-in-JS library if needed (styled-components, emotion)

---

## ✅ Summary

**What Changed**:
- ✅ Created `MainPage.module.css` for static styles
- ✅ Created `styleHelpers.js` for dynamic styles
- ✅ Kept Tailwind for utility classes
- ✅ Organized styles by purpose

**Benefits**:
- 🎯 Cleaner JSX code
- 🚀 Better performance
- 🧪 Easier to test
- 🔧 More maintainable
- 📦 Better code organization

**Next Steps**:
- Review and use helper functions in MainPage.jsx
- Add more helpers as needed
- Document any custom patterns

---

**Last Updated**: November 5, 2025
