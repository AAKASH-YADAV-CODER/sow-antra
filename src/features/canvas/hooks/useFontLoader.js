import { useEffect, useCallback } from 'react';

/**
 * Hook to dynamically load Google Fonts
 * @param {Array} pages - The pages array containing elements
 */
const useFontLoader = (pages) => {

    // Helper to load a single font family
    const loadFont = useCallback((fontFamily) => {
        if (!fontFamily) return;

        // Check if font is already loaded or being loaded
        if (document.querySelector(`link[data-font="${fontFamily}"]`)) {
            return;
        }

        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
        link.rel = 'stylesheet';
        link.dataset.font = fontFamily;
        document.head.appendChild(link);
    }, []);

    // Memoize the collection of fonts to avoid re-running on every render/drag
    // We create a string signature of all used fonts to use as a dependency
    const uniqueFontsSignature = JSON.stringify(
        Array.from(
            new Set(
                pages?.flatMap(page =>
                    page.elements
                        .filter(el => el.type === 'text' && el.fontFamily)
                        .map(el => el.fontFamily)
                ) || []
            )
        ).sort()
    );

    // Effect to load fonts - Depend on the signature, not the pages object
    useEffect(() => {
        if (!uniqueFontsSignature) return;

        if (uniqueFontsSignature && uniqueFontsSignature !== 'undefined') {
            try {
                const fonts = JSON.parse(uniqueFontsSignature);
                fonts.forEach(font => loadFont(font));
            } catch (error) {
                console.error('Error parsing fonts signature:', error);
            }
        }
    }, [uniqueFontsSignature, loadFont]);

    return { loadFont };
};

export default useFontLoader;
