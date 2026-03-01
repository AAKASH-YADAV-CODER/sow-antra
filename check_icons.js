const lucide = require('lucide-react');
const icons = [
    'PieChart', 'Grid', 'Type', 'Zap', 'Layout',
    'Square', 'Circle', 'Smartphone', 'Laptop', 'Monitor',
    'Globe', 'Instagram', 'Facebook', 'Youtube', 'Music2',
    'Star', 'Hexagon', 'Heart', 'Cloud', 'Shield',
    'ArrowRight', 'Minus', 'MessageSquare',
    'Activity', 'Info', 'AlertCircle',
    'HelpCircle', 'CheckCircle', 'XCircle', 'MapPin', 'PlayCircle', 'PauseCircle',
    'Bookmark', 'Tag', 'CreditCard', 'Flag', 'Search',
    'MousePointer', 'Image', 'Upload', 'LayoutTemplate',
    'FolderOpen', 'X', 'Sticker', 'Crop', 'Check', 'Palette'
];

console.log('Checking icons...');
icons.forEach(icon => {
    if (!lucide[icon]) {
        console.log(`MISSING: ${icon}`);
    } else {
        // console.log(`OK: ${icon}`);
    }
});
console.log('Done.');
