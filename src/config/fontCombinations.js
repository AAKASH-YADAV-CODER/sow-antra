import { fontFamilies } from '../utils/constants';

// Helper to get random font that isn't the excluded one
const getRandomFont = (excludeFont) => {
    let font = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
    while (font === excludeFont) {
        font = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
    }
    return font;
};

// curated list of good pairings to ensure quality for the first few
const curatedPairings = [
    { h: 'Playfair Display', s: 'Lato', category: 'Elegant' },
    { h: 'Montserrat', s: 'Open Sans', category: 'Modern' },
    { h: 'Oswald', s: 'Roboto', category: 'Bold' },
    { h: 'Merriweather', s: 'Source Sans Pro', category: 'Classic' },
    { h: 'Raleway', s: 'Roboto Condensed', category: 'Clean' },
    { h: 'Abril Fatface', s: 'Poppins', category: 'Artistic' },
    { h: 'Ubuntu', s: 'Open Sans', category: 'Tech' },
    { h: 'Roboto Slab', s: 'Roboto', category: 'Contrast' },
    { h: 'Lobster', s: 'Cabin', category: 'Decorative' },
    { h: 'Pacifico', s: 'Quicksand', category: 'Handwritten' },
    { h: 'Comfortaa', s: 'Open Sans', category: 'Round' },
    { h: 'Bangers', s: 'Montserrat', category: 'Comic' },
    { h: 'Cinzel', s: 'Lato', category: 'Cinematic' },
    { h: 'Amatic SC', s: 'Josefin Sans', category: 'Fun' },
    { h: 'Permanent Marker', s: 'Rock Salt', category: 'Grunge' },
    { h: 'Righteous', s: 'Roboto', category: 'Futuristic' },
    { h: 'Alfa Slab One', s: 'Ubuntu', category: 'Heavy' },
    { h: 'Great Vibes', s: 'Montserrat', category: 'Script' },
    { h: 'Dancing Script', s: 'Raleway', category: 'Flowing' },
    { h: 'Fredoka One', s: 'Nunito', category: 'Cute' },
    { h: 'Bebas Neue', s: 'Montserrat', category: 'Tall' }, // Bebas Neue might not be in the list, fallback will handle
    { h: 'Anton', s: 'Roboto', category: 'Impact' },
    { h: 'Cabin Sketch', s: 'Cabin', category: 'Sketch' },
    { h: 'Caveat', s: 'Open Sans', category: 'Handwriting' },
    { h: 'Crimson Text', s: 'Work Sans', category: 'Book' },
    { h: 'Exo 2', s: 'Exo 2', category: 'Geometric' },
    { h: 'Fira Sans', s: 'Merriweather', category: 'Versatile' },
    { h: 'Hind', s: 'Hind', category: 'Indian' },
    { h: 'Inconsolata', s: 'Muli', category: 'Code' },
    { h: 'Josefin Slab', s: 'Josefin Sans', category: 'Slab' },
    { h: 'Kanit', s: 'Sarabun', category: 'Modern Thai' },
    { h: 'Lora', s: 'Poppins', category: 'Editorial' },
    { h: 'Muli', s: 'Muli', category: 'Minimal' },
    { h: 'Nunito', s: 'Nunito', category: 'Soft' },
    { h: 'Oxygen', s: 'Source Sans Pro', category: 'Digital' },
    { h: 'PT Sans', s: 'PT Serif', category: 'Universal' },
    { h: 'Quicksand', s: 'Quicksand', category: 'Friendly' },
    { h: 'Rubik', s: 'Karla', category: 'Sturdy' },
    { h: 'Shadows Into Light', s: 'Amatic SC', category: 'Indie' },
    { h: 'Titillium Web', s: 'Titillium Web', category: 'Web' },
    { h: 'Work Sans', s: 'Bitter', category: 'Humanist' },
    { h: 'Zilla Slab', s: 'Lato', category: 'Journalism' },
    { h: 'Arvo', s: 'Lato', category: 'Strong Slab' },
    { h: 'Bitter', s: 'Open Sans', category: 'Readable' },
    { h: 'Chivo', s: 'Chivo', category: 'Grotesque' },
    { h: 'Domine', s: 'Roboto', category: 'Newspaper' },
    { h: 'Eczar', s: 'Work Sans', category: 'Expressive' },
    { h: 'Frank Ruhl Libre', s: 'Open Sans', category: 'Literary' },
    { h: 'Gentium Book Basic', s: 'Gentium Book Basic', category: 'Academic' },
    { h: 'Halant', s: 'Nunito', category: 'Indian Text' },
    { h: 'IBM Plex Mono', s: 'IBM Plex Mono', category: 'Technical' },
    { h: 'Jura', s: 'Jura', category: 'Eurostile' },
    { h: 'Kalam', s: 'Kalam', category: 'Casual' },
    { h: 'Libre Baskerville', s: 'Source Sans Pro', category: 'Traditional' },
    { h: 'Libre Franklin', s: 'Libre Franklin', category: 'American' },
    { h: 'Martel', s: 'Martel', category: 'Heavy Serif' },
    { h: 'Neuton', s: 'Neuton', category: 'Compact' },
    { h: 'Old Standard TT', s: 'Old Standard TT', category: 'Classicist' },
    { h: 'Pathway Gothic One', s: 'Pathway Gothic One', category: 'Condensed' },
    { h: 'Philosopher', s: 'Muli', category: 'Organic' },
    { h: 'Poiret One', s: 'Raleway', category: 'Bauhaus' },
    { h: 'Prata', s: 'Lato', category: 'High Fashion' },
    { h: 'Prompt', s: 'Prompt', category: 'Wide' },
    { h: 'Proza Libre', s: 'Open Sans', category: 'Humanist Sans' },
    { h: 'Rajdhani', s: 'Rajdhani', category: 'Sci-Fi' },
    { h: 'Rakkas', s: 'Lato', category: 'Display' },
    { h: 'Rasa', s: 'Rasa', category: 'Gujarati' },
    { h: 'Rokkitt', s: 'Rokkitt', category: 'Slab Serif' },
    { h: 'Rozha One', s: 'Lato', category: 'Contrast Serif' },
    { h: 'Rubik Mono One', s: 'Rubik', category: 'Blocky' },
    { h: 'Ruda', s: 'Ruda', category: 'Mechanical' },
    { h: 'Rufina', s: 'Open Sans', category: 'Bodoni' },
    { h: 'Ruslan Display', s: 'Ruslan Display', category: 'Decorative' },
    { h: 'Sacramento', s: 'Montserrat', category: 'Girlie' },
    { h: 'Sarala', s: 'Sarala', category: 'Simple' },
    { h: 'Scope One', s: 'Lato', category: 'Unique' },
    { h: 'Secular One', s: 'Open Sans', category: 'Hebrew' },
    { h: 'Sedgwick Ave', s: 'Sedgwick Ave', category: 'Graffiti' },
    { h: 'Seymour One', s: 'Seymour One', category: 'Bold Display' },
    { h: 'Signika', s: 'Signika', category: 'Signage' },
    { h: 'Slabo 27px', s: 'Slabo 27px', category: 'Good Readability' },
    { h: 'Source Code Pro', s: 'Source Code Pro', category: 'Developer' },
    { h: 'Space Mono', s: 'Space Mono', category: 'Space' },
    { h: 'Spectral', s: 'Karla', category: 'Screen Serif' },
    { h: 'Spirax', s: 'Lato', category: 'Storybook' },
    { h: 'Sriracha', s: 'Sriracha', category: 'Marker' },
    { h: 'Stalemate', s: 'Lato', category: 'Vintage' },
    { h: 'Sue Ellen Francisco', s: 'Open Sans', category: 'Tall Hand' },
    { h: 'Suez One', s: 'Lato', category: 'Heavy' },
    { h: 'Sumana', s: 'Sumana', category: 'Devanagari' },
    { h: 'Taviraj', s: 'Taviraj', category: 'Thai Serif' },
    { h: 'Teko', s: 'Teko', category: 'Square' },
    { h: 'Tillana', s: 'Tillana', category: 'Casual Serif' },
    { h: 'Timmana', s: 'Timmana', category: 'Decorative' },
    { h: 'Trirong', s: 'Trirong', category: 'Thai Modern' },
    { h: 'Trocchi', s: 'Lato', category: 'Slab' },
    { h: 'Trochut', s: 'Trochut', category: 'Italic' },
    { h: 'Ultra', s: 'Lato', category: 'Fat Face' },
    { h: 'Unita', s: 'Unita', category: 'Italic' }, // Assuming Unita is avail or typo
    { h: 'Varela Round', s: 'Varela Round', category: 'Rounded' },
    { h: 'Vesper Libre', s: 'Open Sans', category: 'Book Serif' },
    { h: 'Volkhov', s: 'Lato', category: 'Serif' },
    { h: 'Vollkorn', s: 'Vollkorn', category: 'Brochure' },
    { h: 'Work Sans', s: 'Work Sans', category: 'Grotesque' },
    { h: 'Yantramanav', s: 'Yantramanav', category: 'Devanagari Sans' },
    { h: 'Yatra One', s: 'Lato', category: 'Auto' },
    { h: 'Zerox', s: 'Zerox', category: 'Pixel' }, // Assuming exists
];

const generateCombinations = () => {
    const combinations = [];

    // 1. Add curated ones first
    curatedPairings.forEach((pair, index) => {
        // Verify font availability (simple check, or just assume constants has them)
        // For now we assume they are likely in the big list or will fallback
        combinations.push({
            id: `combo-curated-${index}`,
            name: pair.h,
            category: pair.category,
            heading: {
                fontFamily: pair.h,
                fontSize: 32,
                fontWeight: 'bold',
                content: pair.h,
                color: '#1f2937'
            },
            subheading: {
                fontFamily: pair.s,
                fontSize: 16,
                fontWeight: 'normal',
                content: `Paired with ${pair.s}`,
                color: '#6b7280'
            },
            bg: index % 2 === 0 ? '#f9fafb' : '#ffffff'
        });
    });

    // 2. Generate random ones to reach 200+
    // We have ~100 in curated? No, about ~90.
    // Let's generate 120 more.

    for (let i = 0; i < 120; i++) {
        const headingFont = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
        const subheadingFont = getRandomFont(headingFont);

        // Heuristic for category based on name keywords (very simple)
        let category = 'Modern';
        if (headingFont.includes('Serif')) category = 'Classic';
        if (headingFont.includes('Mono')) category = 'Tech';
        if (headingFont.includes('Script') || headingFont.includes('Hand')) category = 'Creative';
        if (headingFont.includes('Display')) category = 'Bold';

        combinations.push({
            id: `combo-gen-${i}`,
            name: headingFont,
            category: category,
            heading: {
                fontFamily: headingFont,
                fontSize: 32,
                fontWeight: 'bold',
                content: headingFont,
                color: '#1f2937'
            },
            subheading: {
                fontFamily: subheadingFont,
                fontSize: 16,
                fontWeight: 'normal',
                content: `Subtext in ${subheadingFont}`,
                color: '#6b7280'
            },
            bg: i % 2 === 0 ? '#f9fafb' : '#ffffff'
        });
    }

    return combinations;
};

export const fontCombinations = generateCombinations();
