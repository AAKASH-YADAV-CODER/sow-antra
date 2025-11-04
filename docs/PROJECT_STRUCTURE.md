# 📁 Sowntra Project Structure Guide

## 🎯 Overview
This document explains the organized structure of the Sowntra project, making it easy for developers to understand and navigate the codebase.

---

## 📂 Directory Structure

```
sowntra/
├── public/                     # Static public assets
│   ├── index.html             # HTML template
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # SEO robots file
│
├── src/                        # Source code
│   ├── assets/                # Static assets (images, fonts, icons)
│   │   ├── images/            # Image files
│   │   └── fonts/             # Custom fonts
│   │
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Shared components across features
│   │   │   ├── Button/        # Reusable button component
│   │   │   ├── Modal/         # Reusable modal component
│   │   │   └── ShareButton/   # Share functionality component
│   │   │
│   │   ├── layout/            # Layout components
│   │   │   ├── Navbar/        # Navigation bar
│   │   │   ├── Header/        # Page header
│   │   │   └── Footer/        # Page footer
│   │   │
│   │   └── MainPage/          # MainPage-specific components (legacy)
│   │       ├── modals/        # Modal components
│   │       └── ...            # Other MainPage components
│   │
│   ├── features/              # Feature-based modules
│   │   ├── auth/              # Authentication feature
│   │   │   ├── components/    # Auth-specific components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── SignupForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── hooks/         # Auth-specific hooks
│   │   │   └── utils/         # Auth utilities
│   │   │
│   │   ├── canvas/            # Canvas/Design editor feature
│   │   │   ├── components/    # Canvas-specific components
│   │   │   │   ├── CanvasElement.jsx
│   │   │   │   ├── EffectsPanel.jsx
│   │   │   │   ├── SelectionHandles.jsx
│   │   │   │   ├── GradientPicker.jsx
│   │   │   │   ├── RecordingStatus.jsx
│   │   │   │   ├── VideoSettings.jsx
│   │   │   │   └── MobileDrawers.jsx
│   │   │   ├── hooks/         # Canvas-specific hooks
│   │   │   │   ├── useCanvas.js
│   │   │   │   ├── useElements.js
│   │   │   │   ├── useHistory.js
│   │   │   │   └── useRecording.js
│   │   │   └── utils/         # Canvas utilities
│   │   │
│   │   └── templates/         # Templates feature
│   │       ├── components/    # Template-specific components
│   │       │   ├── TemplatesModal.jsx
│   │       │   └── CustomTemplateModal.jsx
│   │       └── data/          # Template data/constants
│   │
│   ├── pages/                 # Page components (routes)
│   │   ├── HomePage.jsx       # Landing/Home page
│   │   ├── SignupPage.jsx     # Signup page
│   │   └── MainPage.jsx       # Main design editor page
│   │
│   ├── hooks/                 # Global custom hooks
│   │   └── (future global hooks)
│   │
│   ├── services/              # External services & API calls
│   │   └── api.js             # API service layer
│   │
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.js     # Authentication context
│   │
│   ├── config/                # Configuration files
│   │   └── firebase.js        # Firebase configuration
│   │
│   ├── i18n/                  # Internationalization
│   │   ├── config.js          # i18n configuration
│   │   └── locales/           # Translation files
│   │       ├── en.json        # English
│   │       ├── hi.json        # Hindi
│   │       ├── ta.json        # Tamil
│   │       └── ...            # Other languages
│   │
│   ├── utils/                 # Utility functions & helpers
│   │   ├── constants.js       # App-wide constants
│   │   └── helpers.js         # Helper functions
│   │
│   ├── styles/                # Global styles
│   │   ├── globals.css        # Global CSS
│   │   └── variables.css      # CSS variables
│   │
│   ├── App.js                 # Root component
│   ├── App.css                # App-level styles
│   ├── index.js               # Entry point
│   ├── index.css              # Root styles
│   └── setupTests.js          # Test configuration
│
├── docs/                      # Documentation
│   ├── PROJECT_STRUCTURE.md   # This file
│   ├── MIGRATION_GUIDE.md     # Migration instructions
│   ├── API_DOCUMENTATION.md   # API docs
│   └── COMPONENT_LIBRARY.md   # Component usage guide
│
├── build/                     # Production build output
├── node_modules/              # Dependencies
├── .env                       # Environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
├── tailwind.config.js        # Tailwind configuration
└── README.md                 # Project README

```

---

## 🎨 Feature-Based Architecture

### Why Feature-Based?
- **Scalability**: Easy to add new features
- **Maintainability**: Related code stays together
- **Team Collaboration**: Multiple developers can work on different features
- **Code Discovery**: Easy to find what you need

### Feature Structure Template
```
features/
└── feature-name/
    ├── components/       # Feature-specific components
    ├── hooks/           # Feature-specific hooks
    ├── utils/           # Feature-specific utilities
    ├── types/           # TypeScript types (if using TS)
    ├── constants.js     # Feature constants
    └── index.js         # Public API of the feature
```

---

## 📋 File Naming Conventions

### Components
- **React Components**: PascalCase with `.jsx` extension
  - ✅ `Button.jsx`, `UserProfile.jsx`
  - ❌ `button.jsx`, `userProfile.jsx`

### Hooks
- **Custom Hooks**: camelCase starting with `use`
  - ✅ `useAuth.js`, `useCanvas.js`
  - ❌ `UseAuth.js`, `auth.js`

### Utilities
- **Utility Files**: camelCase with `.js` extension
  - ✅ `helpers.js`, `formatDate.js`
  - ❌ `Helpers.js`, `FormatDate.js`

### Constants
- **Constant Files**: camelCase or UPPERCASE
  - ✅ `constants.js`, `API_ENDPOINTS.js`

---

## 🔄 Migration Guide

### Step 1: Move Components
Move existing components to their appropriate feature folders:

```bash
# Example: Moving canvas-related components
src/components/MainPage/CanvasElement.jsx 
  → src/features/canvas/components/CanvasElement.jsx

src/components/MainPage/EffectsPanel.jsx 
  → src/features/canvas/components/EffectsPanel.jsx
```

### Step 2: Update Imports
Update all import statements in files that reference moved components:

```javascript
// Before
import CanvasElement from '../components/MainPage/CanvasElement';

// After
import CanvasElement from '../features/canvas/components/CanvasElement';
```

### Step 3: Move Hooks
Move feature-specific hooks to their feature folders:

```bash
src/hooks/useCanvas.js 
  → src/features/canvas/hooks/useCanvas.js
```

### Step 4: Test
Run tests and verify everything still works:
```bash
npm test
npm start
```

---

## 🎯 Best Practices

### 1. Component Organization
```jsx
// Component file structure
import React from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css'; // If using CSS modules

// 1. Imports
// 2. Component definition
// 3. PropTypes
// 4. Default export

const ComponentName = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string,
  prop2: PropTypes.func
};

export default ComponentName;
```

### 2. Feature Index Files
Create `index.js` in each feature to export public APIs:

```javascript
// features/canvas/index.js
export { default as CanvasElement } from './components/CanvasElement';
export { default as EffectsPanel } from './components/EffectsPanel';
export { useCanvas } from './hooks/useCanvas';
```

### 3. Absolute Imports
Consider setting up absolute imports in `jsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@components/*": ["components/*"],
      "@features/*": ["features/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

Then import like:
```javascript
import { Button } from '@components/common/Button';
import { useCanvas } from '@features/canvas/hooks/useCanvas';
```

---

## 📚 Additional Documentation

- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Detailed migration steps
- **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** - Component usage examples
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoints and usage

---

## 🤝 Contributing

When adding new features:
1. Create a new folder under `features/`
2. Follow the feature structure template
3. Update this documentation
4. Add examples to component library

---

## 📞 Support

For questions about the project structure:
- Check existing documentation
- Ask in team chat
- Create an issue on GitHub

---

**Last Updated**: November 5, 2025
**Maintained by**: Sowntra Development Team
