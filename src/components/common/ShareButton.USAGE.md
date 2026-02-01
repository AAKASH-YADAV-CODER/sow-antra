# ShareButton Quick Start Guide

## 🎯 Quick Reference

### Import
```jsx
import ShareButton from '../components/ShareButton';
```

### Basic Usage
```jsx
<ShareButton />
```

### With Props
```jsx
<ShareButton 
  url="https://myapp.com/project/123"
  title="My Project"
  text="Check out my amazing project!"
  className="px-4 py-2"
/>
```

## 📱 Visual Flow

```
User Clicks Share Button
         ↓
    Check Browser Support
         ↓
    ┌────┴────┐
    ↓         ↓
Native API   Custom Modal
Supported    Fallback
    ↓         ↓
Opens        Shows Modal with:
Native       - WhatsApp
Share        - Telegram
Sheet        - Twitter
             - Email
             - Copy Link
```

## 🎨 Component Structure

```
ShareButton
├── Share Button (Blue, with icon)
│
├── Native Share API
│   └── Opens device share sheet
│
└── Custom Modal (Fallback)
    ├── Header (with close button)
    ├── Share Options Grid (4 columns)
    │   ├── WhatsApp (Green)
    │   ├── Telegram (Blue)
    │   ├── Twitter (Gray)
    │   └── Email (Red)
    ├── Copy Link Section
    │   ├── URL Display
    │   └── Copy Button
    └── Toast Notification (on copy)
```

## 🔧 Props Table

| Prop | Type | Required | Default | Example |
|------|------|----------|---------|---------|
| `url` | string | No | `window.location.href` | `"https://myapp.com/page"` |
| `title` | string | No | `"Check this out!"` | `"My Project"` |
| `text` | string | No | `"I want to share..."` | `"Check out my design!"` |
| `className` | string | No | `""` | `"px-3 py-1.5 text-sm"` |

## 🎬 User Flow Examples

### Mobile User (iOS Safari)
1. Taps Share button
2. Native iOS share sheet appears
3. Sees all installed apps (WhatsApp, Messages, Mail, etc.)
4. Selects desired app
5. Content is pre-filled
6. Sends share

### Desktop User (Chrome)
1. Clicks Share button
2. Custom modal appears
3. Can click WhatsApp → Opens WhatsApp Web
4. Or clicks Copy → Link copied, toast appears
5. Can click outside modal to close

## 💻 Code Examples

### Example 1: Simple Project Share
```jsx
function ProjectCard({ project }) {
  return (
    <div className="card">
      <h3>{project.title}</h3>
      <ShareButton 
        url={`${window.location.origin}/project/${project.id}`}
        title={project.title}
        text={`Check out ${project.title} on Sowntra!`}
      />
    </div>
  );
}
```

### Example 2: Campaign Share with Tracking
```jsx
function CampaignShare() {
  const shareUrl = `${baseUrl}?utm_source=share&utm_medium=social&utm_campaign=spring2024`;
  
  return (
    <ShareButton 
      url={shareUrl}
      title="Spring Campaign 2024"
      text="🌸 Check out our Spring Campaign!"
    />
  );
}
```

### Example 3: Conditional Share
```jsx
function ConditionalShare({ isPublic, projectUrl }) {
  if (!isPublic) return null;
  
  return (
    <ShareButton 
      url={projectUrl}
      title="Public Project"
      text="This project is now public!"
      className="bg-green-600 hover:bg-green-700"
    />
  );
}
```

### Example 4: Multiple Share Buttons
```jsx
function MultiShare() {
  const baseUrl = window.location.origin;
  
  return (
    <div className="share-options">
      <ShareButton 
        url={`${baseUrl}/project/1`}
        title="Project 1"
        className="mb-2"
      />
      <ShareButton 
        url={`${baseUrl}/project/2`}
        title="Project 2"
        className="mb-2"
      />
    </div>
  );
}
```

## 🎯 Common Use Cases

### 1. Share Current Page
```jsx
<ShareButton />
```

### 2. Share Specific Item
```jsx
<ShareButton 
  url={`https://myapp.com/item/${itemId}`}
  title={itemTitle}
  text={`Check out ${itemTitle}!`}
/>
```

### 3. Share with Custom Message
```jsx
<ShareButton 
  text="🎨 I just created something amazing! Come see!"
/>
```

### 4. Compact Version
```jsx
<ShareButton className="px-2 py-1 text-xs" />
```

### 5. Full Width Button
```jsx
<ShareButton className="w-full justify-center" />
```

## 🎨 Styling Examples

### Custom Colors
```jsx
<ShareButton className="bg-purple-600 hover:bg-purple-700" />
```

### Different Sizes
```jsx
// Small
<ShareButton className="px-2 py-1 text-sm" />

// Medium (Default)
<ShareButton />

// Large
<ShareButton className="px-6 py-3 text-lg" />
```

### Rounded Styles
```jsx
// More rounded
<ShareButton className="rounded-full" />

// Less rounded
<ShareButton className="rounded-md" />
```

## 🧪 Testing Checklist

- [ ] Click share button on mobile → Native sheet appears
- [ ] Click share button on desktop → Modal appears
- [ ] Click WhatsApp option → Opens WhatsApp
- [ ] Click Telegram option → Opens Telegram
- [ ] Click Twitter option → Opens Twitter
- [ ] Click Email option → Opens email client
- [ ] Click Copy button → Link copied
- [ ] Toast notification appears after copy
- [ ] Modal closes when clicking outside
- [ ] Modal closes when clicking X button
- [ ] Button has hover effect
- [ ] Button has active/pressed effect

## 🐛 Troubleshooting

### Issue: Native share not working
**Solution**: Ensure you're using HTTPS and a supported browser

### Issue: Copy not working
**Solution**: Check HTTPS, clipboard permissions, and console errors

### Issue: Modal stays open
**Solution**: Check for z-index conflicts or event propagation issues

### Issue: Share URLs not working
**Solution**: Ensure URLs are properly encoded with `encodeURIComponent()`

## 📊 Analytics Integration

```jsx
function AnalyticsShareButton() {
  const handleShare = () => {
    // Track share event
    analytics.track('share_clicked', {
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  };
  
  return (
    <div onClick={handleShare}>
      <ShareButton />
    </div>
  );
}
```

## 🌍 Internationalization

```jsx
const translations = {
  en: { text: "Check this out!" },
  es: { text: "¡Mira esto!" },
  fr: { text: "Regardez ça!" }
};

function I18nShareButton({ lang = 'en' }) {
  return (
    <ShareButton 
      text={translations[lang].text}
    />
  );
}
```

## 🎁 Pro Tips

1. **Always use HTTPS** - Required for Web Share API
2. **Test on real devices** - Behavior differs across platforms
3. **Keep URLs short** - Better for sharing
4. **Add UTM parameters** - Track share performance
5. **Descriptive text** - Engage users to share
6. **Responsive design** - Component adapts to all screens
7. **Accessibility** - Keyboard navigation supported

## 📞 Support

For issues or questions:
1. Check the main README: `ShareButton.README.md`
2. Review this usage guide
3. Test in different browsers
4. Check browser console for errors

---

**Happy Sharing! 🎉**

