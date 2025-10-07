# ShareButton Component Documentation

A professional, production-ready React share button component with native Web Share API support and beautiful fallback modal.

## ✨ Features

- 🚀 **Native Web Share API**: Automatically uses the device's native share sheet on supported browsers
- 🎨 **Beautiful Fallback Modal**: Custom modal with popular share options when native API is not available
- 📱 **Multiple Share Options**: WhatsApp, Telegram, Twitter (X), and Email
- 📋 **Copy to Clipboard**: One-click link copying with visual feedback
- 🎉 **Toast Notifications**: Elegant toast message when link is copied
- 💎 **Fully Responsive**: Works perfectly on all screen sizes
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation
- 🎯 **Zero Dependencies**: Only uses React and lucide-react icons
- 🎪 **Smooth Animations**: Beautiful fade and slide animations

## 📦 Installation

The component is already installed in your project. Make sure you have the required dependencies:

```bash
npm install lucide-react
```

## 🚀 Basic Usage

```jsx
import ShareButton from '../components/ShareButton';

function MyComponent() {
  return (
    <ShareButton />
  );
}
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | `window.location.href` | The URL to share |
| `title` | `string` | `'Check this out!'` | Title for the share |
| `text` | `string` | `'I want to share this with you'` | Description text to share |
| `className` | `string` | `''` | Additional CSS classes for the button |

## 📝 Examples

### Basic Share Button

```jsx
<ShareButton />
```

### Custom URL and Text

```jsx
<ShareButton 
  url="https://myapp.com/project?id=123"
  title="Check out my design!"
  text="I created this amazing design. Take a look!"
/>
```

### Compact Version for Toolbars

```jsx
<ShareButton 
  url={window.location.href}
  title="My Project"
  text="Share this project"
  className="px-3 py-1.5 text-sm"
/>
```

### Dynamic Content Sharing

```jsx
function ProjectCard({ projectId, projectTitle }) {
  const shareUrl = `https://myapp.com/project/${projectId}`;
  
  return (
    <ShareButton 
      url={shareUrl}
      title={projectTitle}
      text={`Check out my project: ${projectTitle}`}
    />
  );
}
```

## 🎨 Customization

### Custom Styling

You can customize the button appearance using the `className` prop:

```jsx
<ShareButton 
  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full"
/>
```

### Modifying Share Options

To add or remove share options, edit the `shareOptions` array in `ShareButton.jsx`:

```jsx
const shareOptions = [
  {
    name: 'WhatsApp',
    icon: <svg>...</svg>,
    url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    color: 'hover:bg-green-50 hover:text-green-600'
  },
  // Add more options here...
];
```

## 🌐 Browser Support

### Native Web Share API

The component automatically detects and uses the native share sheet on:

- ✅ Safari (iOS and macOS)
- ✅ Chrome (Android)
- ✅ Edge (Windows)
- ✅ Samsung Internet
- ✅ Opera (Android)

### Custom Modal Fallback

On browsers without native share support, the component shows a custom modal:

- ✅ Chrome (Desktop)
- ✅ Firefox (Desktop)
- ✅ Safari (older versions)
- ✅ All other desktop browsers

## 🔧 How It Works

1. **Share Button Click**: User clicks the share button
2. **API Detection**: Component checks if `navigator.share` is available
3. **Native Share**: If available, opens the device's native share sheet
4. **Fallback Modal**: If not available, displays a custom modal with:
   - Share options for popular platforms
   - Copy to clipboard functionality
   - Toast notification on successful copy

## 📱 Share Platform URLs

The component uses these URL schemes to share content:

- **WhatsApp**: `https://wa.me/?text={message}`
- **Telegram**: `https://t.me/share/url?url={url}&text={text}`
- **Twitter/X**: `https://twitter.com/intent/tweet?text={text}&url={url}`
- **Email**: `mailto:?subject={title}&body={message}`

## 🎯 Best Practices

1. **Descriptive Text**: Use clear, engaging text for the share message
   ```jsx
   <ShareButton 
     text="I just created something amazing on Sowntra! 🎨"
   />
   ```

2. **Unique URLs**: Include relevant parameters in the URL
   ```jsx
   <ShareButton 
     url={`${baseUrl}?projectId=${id}&ref=share`}
   />
   ```

3. **Context-Aware Titles**: Make titles specific to the content
   ```jsx
   <ShareButton 
     title={`${userName}'s Design on Sowntra`}
   />
   ```

4. **Analytics Tracking**: Add tracking parameters to URLs
   ```jsx
   <ShareButton 
     url={`${url}?utm_source=share&utm_medium=social`}
   />
   ```

## 🐛 Troubleshooting

### Native Share Not Working

If native share doesn't work on a supported device:

1. Check if the page is served over HTTPS (required for Web Share API)
2. Ensure the browser version supports the API
3. Check browser console for any errors

### Copy to Clipboard Fails

If clipboard copying fails:

1. Ensure the page has proper permissions
2. Check if the page is served over HTTPS (required in most browsers)
3. The component includes a fallback using `document.execCommand('copy')`

### Modal Not Closing

If the modal doesn't close when clicking outside:

1. Check for any z-index conflicts with other elements
2. Ensure no parent elements have `pointer-events: none`
3. Verify that click events are not being stopped by other handlers

## 🎓 Testing the Component

To test the ShareButton in your application:

1. **Run the Development Server**:
   ```bash
   npm start
   ```

2. **Access the Demo Page**: 
   Navigate to `/share-demo` (if you've set up routing) or use the component in MainPage.jsx

3. **Test Native Share**:
   - Open the app on a mobile device or Safari
   - Click the share button
   - Verify the native share sheet appears

4. **Test Fallback Modal**:
   - Open the app in Chrome or Firefox (desktop)
   - Click the share button
   - Verify the custom modal appears
   - Test each share option
   - Test the copy to clipboard feature

## 📄 Files Structure

```
src/
├── components/
│   ├── ShareButton.jsx          # Main component
│   └── ShareButton.README.md    # This documentation
└── pages/
    ├── MainPage.jsx             # Component integrated here
    └── ShareButtonDemo.jsx      # Demo page
```

## 🤝 Integration Example

Here's how the ShareButton is integrated into MainPage.jsx:

```jsx
import ShareButton from '../components/ShareButton';

function MainPage() {
  return (
    <div className="toolbar">
      {/* Other toolbar items */}
      
      <ShareButton 
        url={window.location.href}
        title="Check out my design on Sowntra!"
        text="I created this amazing design on Sowntra. Check it out!"
        className="px-3 py-1.5"
      />
      
      {/* Other toolbar items */}
    </div>
  );
}
```

## 🚀 Future Enhancements

Potential improvements for the component:

1. **More Share Options**: LinkedIn, Reddit, Pinterest, etc.
2. **Share Analytics**: Track which platforms users prefer
3. **Custom Icons**: Allow passing custom icons for share options
4. **Themes**: Dark mode support
5. **Success Callbacks**: Callbacks for successful shares
6. **QR Code**: Generate QR code for easy mobile sharing
7. **Short URLs**: Integration with URL shortening services

## 📚 Additional Resources

- [Web Share API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Clipboard API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [lucide-react Icons](https://lucide.dev/)

## 💡 Tips

1. **Test on Multiple Devices**: The experience differs between mobile and desktop
2. **Use Descriptive Messages**: Make the share text engaging and informative
3. **Track Share Performance**: Monitor which share options are most popular
4. **Keep URLs Clean**: Use clean, readable URLs that work well when shared
5. **Consider Internationalization**: Adapt share text for different languages

---

**Built with ❤️ using React and best practices**

