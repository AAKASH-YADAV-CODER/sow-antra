import { fontFamilies, socialMediaTemplates } from '../utils/constants';

/**
 * Editable Templates Library
 * Each template contains metadata and a list of elements to be placed on the canvas.
 * Elements use 'base' units (relative to a 1000px baseline) which are scaled by addElement.
 */
export const editableTemplates = {
    // --- MANUAL HIGH QUALITY TEMPLATES ---
    insta_sale: {
        id: 'insta_sale',
        name: 'Flash Sale Post',
        category: 'Social Media',
        subcategory: 'Instagram',
        width: 1080,
        height: 1080,
        previewImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=400',
        elements: [
            { type: 'rectangle', fill: '#FFD700', x: 0, y: 0, width: 1000, height: 1000 },
            { type: 'text', content: 'FLASH SALE', fontSize: 120, fontWeight: '900', color: '#000', x: 100, y: 200, width: 800, fontFamily: 'Montserrat' },
            { type: 'text', content: 'UP TO 50% OFF', fontSize: 60, fontWeight: 'bold', color: '#000', x: 100, y: 350, width: 800, fontFamily: 'Poppins' },
            { type: 'rectangle', fill: '#000', x: 100, y: 450, width: 300, height: 80, borderRadius: 10 },
            { type: 'text', content: 'SHOP NOW', fontSize: 30, color: '#FFF', x: 100, y: 460, width: 300, textAlign: 'center', fontFamily: 'Roboto' }
        ]
    }
};

// --- DATA GENERATOR FOR 1000+ DIVERSIFIED TEMPLATES ---

const categoryMetadata = {
    'Social Media': {
        keywords: ['social', 'app', 'community', 'modern'],
        headlines: ['CONNECT WITH US', 'NEW POST ALERT', 'TRENDING NOW', 'JOIN THE VIBE'],
        sublines: ['Follow for more updates', 'Check out our latest story', 'Available on all platforms'],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        fontPair: ['Montserrat', 'Poppins'],
        sizeKey: 'instagramPost'
    },
    'Marketing': {
        keywords: ['marketing', 'office', 'strategy', 'growth'],
        headlines: ['GROW YOUR BUSINESS', 'MARKETING PROS', 'STRATEGY SESSION', 'BOOST YOUR ROI'],
        sublines: ['Proven results for your brand', 'Join 10,000+ happy clients', 'Expert soltuions for everyone'],
        colors: ['#1e293b', '#334155', '#475569', '#64748b'],
        fontPair: ['Roboto', 'Lato'],
        sizeKey: 'facebookPost'
    },
    'Business': {
        keywords: ['business', 'suit', 'laptop', 'graph'],
        headlines: ['CORPORATE SOLUTIONS', 'ANNUAL REPORT', 'BUSINESS PARTNERS', 'GLOBAL REACH'],
        sublines: ['Integrity & Innovation', 'Excellence in every step', 'Your success is our mission'],
        colors: ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb'],
        fontPair: ['Open Sans', 'Roboto Slab'],
        sizeKey: 'linkedinPost'
    },
    'Education': {
        keywords: ['books', 'school', 'study', 'graduate'],
        headlines: ['LEARN NEW SKILLS', 'EDUCATION FOR ALL', 'GRADUATION DAY', 'MASTERCLASS'],
        sublines: ['Broaden your horizons', 'Unlock your potential today', 'Expert-led courses online'],
        colors: ['#065f46', '#047857', '#059669', '#10b981'],
        fontPair: ['PT Serif', 'Noto Serif'],
        sizeKey: 'a4Document'
    },
    'Food': {
        keywords: ['food', 'burger', 'pizza', 'restaurant'],
        headlines: ['DELICIOUS SPECIALS', 'BEST FOOD IN TOWN', 'GOURMET DINING', 'ORDER NOW'],
        sublines: ['Fresh ingredients every day', 'Taste the perfection', 'Free delivery on first order'],
        colors: ['#991b1b', '#b91c1c', '#dc2626', '#ef4444'],
        fontPair: ['Playfair Display', 'Lora'],
        sizeKey: 'instagramPost'
    },
    'Travel': {
        keywords: ['travel', 'beach', 'mountain', 'vacation'],
        headlines: ['EXPLORE THE WORLD', 'DREAM DESTINATION', 'ADVENTURE AWAITS', 'WANDERLUST'],
        sublines: ['Plan your next trip with us', 'Unforgettable experiences', 'Discover hidden gems'],
        colors: ['#0369a1', '#0284c7', '#0ea5e9', '#38bdf8'],
        fontPair: ['Oswald', 'Raleway'],
        sizeKey: 'twitterHeader'
    },
    'Health': {
        keywords: ['fitness', 'gym', 'yoga', 'healthy'],
        headlines: ['STAY FIT & HEALTHY', 'YOGA RETREAT', 'WORKOUT PLAN', 'MIND & BODY'],
        sublines: ['Your health is your wealth', 'Start your journey today', 'Train with the best'],
        colors: ['#701a75', '#86198f', '#a21caf', '#c026d3'],
        fontPair: ['Barlow', 'Heebo'],
        sizeKey: 'instagramStory'
    },
    'Technology': {
        keywords: ['tech', 'code', 'future', 'robot'],
        headlines: ['POWERING FUTURE', 'INNOVATION HUB', 'NEXT-GEN TECH', 'SMART SOLUTIONS'],
        sublines: ['Leading the digital era', 'Seamless integration', 'Tomorrow\'s tech today'],
        colors: ['#0f172a', '#1e1b4b', '#312e81', '#3730a3'],
        fontPair: ['Space Mono', 'Inter'],
        sizeKey: 'presentation'
    },
    'E-commerce': {
        keywords: ['shop', 'sale', 'fashion', 'bags'],
        headlines: ['MEGA FLASH SALE', 'SHOP THE LOOK', 'EXCLUSIVE OFFER', 'NEW ARRIVALS'],
        sublines: ['Up to 70% off collection', 'Don\'t miss out', 'Limited time only'],
        colors: ['#be123c', '#e11d48', '#f43f5e', '#fb7185'],
        fontPair: ['Quicksand', 'Josefin Sans'],
        sizeKey: 'instagramPost'
    }
};

const categories = Object.keys(categoryMetadata);
const adjectives = ['Modern', 'Minimal', 'Creative', 'Professional', 'Bold', 'Elegant', 'Clean', 'Colorful', 'Vintage', 'Futuristic'];

for (let i = 1; i <= 1000; i++) {
    const category = categories[i % categories.length];
    const meta = categoryMetadata[category];
    const adj = adjectives[i % adjectives.length];
    const id = `template_${i}`;

    // Pick fonts from the 500+ list
    const headFont = fontFamilies[i * 7 % fontFamilies.length];
    const bodyFont = fontFamilies[i * 13 % fontFamilies.length];

    const size = socialMediaTemplates[meta.sizeKey] || { width: 1080, height: 1080 };

    // Deterministic images for consistency
    const sharedImage = `https://picsum.photos/seed/${id}/800/800`;

    editableTemplates[id] = {
        id,
        name: `${adj} ${category} ${i}`,
        category,
        width: size.width,
        height: size.height,
        thumbnail: '🖼️',
        previewImage: sharedImage,
        elements: [
            // Background
            { type: 'rectangle', fill: meta.colors[i % meta.colors.length], x: 0, y: 0, width: 1000, height: size.height * (1000 / size.width) },

            // Decorative shapes
            {
                type: i % 2 === 0 ? 'circle' : 'hexagon',
                fill: '#FFF',
                opacity: 0.1,
                x: 600,
                y: -100,
                width: 600,
                height: 600
            },

            // Image
            {
                type: 'image',
                src: sharedImage,
                x: 100,
                y: 400,
                width: 800,
                height: 450,
                borderRadius: 20,
                opacity: 0.95
            },

            // Content
            {
                type: 'text',
                content: meta.headlines[i % meta.headlines.length],
                fontSize: 70,
                fontWeight: '900',
                color: '#FFF',
                x: 100,
                y: 100,
                width: 800,
                fontFamily: headFont,
                textAlign: 'left'
            },
            {
                type: 'text',
                content: meta.sublines[i % meta.sublines.length],
                fontSize: 28,
                color: '#e2e8f0',
                x: 100,
                y: 220,
                width: 800,
                fontFamily: bodyFont,
                textAlign: 'left'
            },

            // Call to action button
            {
                type: 'rectangle',
                fill: '#FFF',
                x: 100,
                y: 880,
                width: 250,
                height: 60,
                borderRadius: 30
            },
            {
                type: 'text',
                content: 'KNOW MORE',
                fontSize: 20,
                fontWeight: 'bold',
                color: meta.colors[i % meta.colors.length],
                x: 100,
                y: 898,
                width: 250,
                textAlign: 'center',
                fontFamily: 'Inter'
            }
        ]
    };
}

export const templateCategories = [
    { id: 'All', name: 'All' },
    ...categories.map(c => ({ id: c, name: c }))
];
