# Sowntra Frontend

A collaborative whiteboard application built with React, featuring real-time collaboration, Firebase authentication, and powerful drawing tools.

## Features

- ✅ **Firebase Authentication** - Email/Password and Google OAuth
- ✅ **Real-time Collaboration** - Multiple users can draw simultaneously using Yjs + WebSocket
- ✅ **Canvas Rendering** - High-performance canvas with react-konva
- ✅ **Drawing Tools** - Pen, shapes (rectangle, circle), text, and more
- ✅ **Collaborative Cursors** - See other users' cursors in real-time
- ✅ **Export** - Export boards as PNG images
- ✅ **Cloud Storage** - Firebase Storage for assets and exports
- ✅ **Multi-language Support** - i18n support for multiple languages
- ✅ **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework:** React 19
- **Canvas:** react-konva + Konva.js
- **Real-time:** Yjs + WebSocket
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **HTTP Client:** Axios
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **i18n:** react-i18next

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project
- Backend server running (see backend README)

## Setup Instructions

### 1. Install Dependencies

```bash
cd sowntra-mp
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `sowntra-mp` directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend API
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001/collaboration
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication:
   - Email/Password authentication
   - Google authentication
4. Enable Firebase Storage
5. Get your web app configuration from Project Settings
6. Update `.env` with your Firebase credentials

### 4. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── ShareButton.jsx         # Share functionality component
│   └── ShareButton.README.md   # Share button documentation
├── config/
│   └── firebase.js             # Firebase configuration
├── hooks/
│   ├── useAuth.js              # Authentication hook
│   └── useCollaboration.js     # Real-time collaboration hook
├── i18n/
│   ├── config.js               # i18n configuration
│   └── locales/                # Translation files
├── pages/
│   ├── AuthPage.jsx            # Login/Signup page
│   ├── DashboardPage.jsx       # User dashboard with boards
│   ├── WhiteboardPage.jsx      # Collaborative whiteboard
│   ├── MainPage.jsx            # Original design page
│   └── SignupPage.jsx          # Original signup page
├── services/
│   └── api.js                  # API client and board/asset services
├── App.js                      # Main app component with routing
├── index.js                    # Entry point
└── index.css                   # Global styles
```

## Key Components

### AuthPage

Handles user authentication (login/signup) with Firebase Auth.

### DashboardPage

- Lists all user's boards
- Create new boards
- Delete boards
- Navigate to whiteboard

### WhiteboardPage

Main collaborative whiteboard with:
- Drawing tools (pen, rectangle, circle, text)
- Real-time collaboration
- User presence indicators
- Cursor tracking
- Export functionality
- Undo/Redo support

### useCollaboration Hook

Custom hook that manages:
- WebSocket connection
- Yjs document synchronization
- Active users tracking
- Cursor positions
- Real-time updates

### useAuth Hook

Custom hook for Firebase authentication:
- Sign up with email/password
- Sign in with email/password
- Sign in with Google
- Sign out
- Get ID token for API requests

## API Integration

The app communicates with the backend through:

### REST API (`src/services/api.js`)

- `boardAPI.listBoards()` - Get all boards
- `boardAPI.createBoard(data)` - Create new board
- `boardAPI.getBoard(id)` - Get board details
- `boardAPI.updateBoard(id, data)` - Update board
- `boardAPI.deleteBoard(id)` - Delete board
- `boardAPI.addMember(boardId, data)` - Add member to board
- `boardAPI.removeMember(boardId, memberId)` - Remove member

- `assetAPI.uploadAsset(boardId, file)` - Upload asset
- `assetAPI.getAssets(boardId)` - Get board assets
- `assetAPI.deleteAsset(boardId, assetId)` - Delete asset

### WebSocket (Real-time Collaboration)

Messages exchanged with backend:
- `join` - Join a board session
- `update` - Document updates
- `cursor` - Cursor position updates
- `awareness` - User presence updates
- `sync` - Initial state synchronization

## Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (one-way operation)
npm run eject
```

## Collaborative Features

### Real-time Drawing Synchronization

- All drawing operations are synchronized in real-time using Yjs CRDT
- Conflict-free concurrent editing
- Automatic state persistence to backend

### User Presence

- See who's online with active users list
- Each user has a unique color
- View other users' cursors with names

### Cursor Tracking

- See where other users are working in real-time
- Smooth cursor animations
- Username labels on cursors

## Drawing Tools

### Select Tool
- Select and move shapes
- Transform (resize/rotate) shapes
- Delete selected shapes

### Pen Tool
- Free-hand drawing
- Adjustable stroke width
- Custom colors

### Shape Tools
- Rectangle
- Circle
- Text (with edit on double-click)

### Properties
- Color picker for all tools
- Stroke width adjustment
- Fill and stroke customization

## Export Options

- Export board as PNG image
- High-resolution exports (2x pixel ratio)
- Automatic upload to Firebase Storage
- Update board thumbnail
- Local download

## Internationalization

The app supports multiple languages:
- English, Hindi, Bengali, Tamil, Telugu, Marathi
- Gujarati, Kannada, Malayalam, Punjabi, Urdu
- Arabic, Hebrew, and more

Language can be changed from the interface (available in MainPage).

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `.env`
- Check Firebase project settings
- Ensure authentication methods are enabled

### WebSocket Connection Failed
- Ensure backend server is running
- Check `REACT_APP_WS_URL` in `.env`
- Verify CORS settings on backend

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf build`
- Update dependencies: `npm update`

### Authentication Errors
- Check Firebase Auth configuration
- Verify API key and project ID
- Ensure authentication providers are enabled

## Development Tips

1. **Hot Module Replacement**: Changes are reflected immediately without full refresh
2. **React DevTools**: Install browser extension for better debugging
3. **Network Tab**: Monitor WebSocket messages and API calls
4. **Console Logs**: Check browser console for collaboration events

## Performance Optimization

- Canvas rendering optimized with Konva
- Lazy loading of components
- Efficient Yjs document updates
- Debounced API calls
- Image optimization

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Note: WebSocket support required for real-time collaboration.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

ISC

## Support

For issues and questions:
- Check documentation
- Review existing GitHub issues
- Contact support team

---

Built with ❤️ using React and Firebase
