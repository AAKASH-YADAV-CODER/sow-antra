import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronLeft, Plus, Image as ImageIcon } from 'lucide-react';
import BrandKitPanelSection from './BrandKitPanelSection';

const CANVAS_COLORS = [
    '#000000', '#545454', '#737373', '#a6a6a6', '#d9d9d9', '#ffffff',
    '#ff3131', '#ff5757', '#ff66c4', '#cb6ce6', '#8c52ff', '#5e17eb',
    '#0097a7', '#00c2cb', '#5ce1e6', '#38b6ff', '#5271ff', '#004aad',
    '#008000', '#7ed957', '#c9e265', '#ffde59', '#ffbd59', '#ff914d'
];

const GRAYSCALE_PALETTE = [
    '#000000', '#0d0d0d', '#1a1a1a', '#262626', '#333333', '#404040', '#4d4d4d', '#595959', '#666666', '#737373',
    '#808080', '#8c8c8c', '#999999', '#a6a6a6', '#b3b3b3', '#bfbfbf', '#cccccc', '#d9d9d9', '#e6e6e6', '#f2f2f2',
    '#f8f8f8', '#ffffff'
];

const PASTEL_PALETTE = [
    '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e0bbe4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3',
    '#F0EAD6', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'
];

const EARTHY_PALETTE = [
    '#4a3728', '#5d4037', '#6d4c41', '#795548', '#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8', '#efebe9', '#3e2723',
    '#5c4033', '#8b5e3c', '#a67b5b', '#c19a6b', '#deB887', '#e2c5a1', '#f5f5dc', '#faf0e6', '#fff5ee', '#fdf5e6'
];

const VIBRANT_PALETTE = [
    '#ff0000', '#ff3131', '#ff5757', '#e91e63', '#ff66c4', '#cb6ce6', '#8c52ff', '#5e17eb', '#3f51b5', '#5271ff', '#004aad', '#0070f3',
    '#03989e', '#00c2cb', '#26c6da', '#5ce1e6', '#38b6ff', '#00bcd4', '#4caf50', '#008000', '#7ed957', '#c9e265', '#ccff00', '#ffeb3b',
    '#ffde59', '#ffc107', '#ffbd59', '#ff9800', '#ff914d', '#ff5722', '#795548', '#607d8b', '#000000', '#1a237e', '#0d47a1', '#01579b',
    '#006064', '#1b5e20', '#33691e', '#827717', '#f57f17', '#ff6f00', '#e65100', '#bf360c', '#3e2723', '#212121', '#263238'
];

const CANVAS_GRADIENTS = [
    // Basic & Monochrome
    { colors: ['#000000', '#434343'], stops: [0, 100], type: 'linear', angle: 90, name: 'Midnight' },
    { colors: ['#232526', '#414345'], stops: [0, 100], type: 'linear', angle: 90, name: 'Obsidian' },
    { colors: ['#bdc3c7', '#2c3e50'], stops: [0, 100], type: 'linear', angle: 90, name: 'Elements' },
    // Vibrant & Bright
    { colors: ['#ff9a9e', '#fecfef'], stops: [0, 100], type: 'linear', angle: 90, name: 'Warm Tones' },
    { colors: ['#a1c4fd', '#c2e9fb'], stops: [0, 100], type: 'linear', angle: 90, name: 'Cool Tones' },
    { colors: ['#84fab0', '#8fd3f4'], stops: [0, 100], type: 'linear', angle: 90, name: 'Seafoam' },
    { colors: ['#f6d365', '#fda085'], stops: [0, 100], type: 'linear', angle: 90, name: 'Sunset' },
    { colors: ['#ffecd2', '#fcb69f'], stops: [0, 100], type: 'linear', angle: 90, name: 'Peach' },
    // Deep & Moody
    { colors: ['#667eea', '#764ba2'], stops: [0, 100], type: 'linear', angle: 90, name: 'Purple Haze' },
    { colors: ['#30cfd0', '#330867'], stops: [0, 100], type: 'linear', angle: 90, name: 'Deep Sea' },
    { colors: ['#09203f', '#537895'], stops: [0, 100], type: 'linear', angle: 90, name: 'Stormy' },
    { colors: ['#1e3c72', '#2a5298'], stops: [0, 100], type: 'linear', angle: 90, name: 'Royal' },
    // Soft & Airy
    { colors: ['#5ee7df', '#b490ca'], stops: [0, 100], type: 'linear', angle: 90, name: 'Unicorn' },
    { colors: ['#f093fb', '#f5576c'], stops: [0, 100], type: 'linear', angle: 90, name: 'Lollipop' },
    { colors: ['#e2ebf0', '#cfd9df'], stops: [0, 100], type: 'linear', angle: 90, name: 'Cloudy' },
    { colors: ['#a8edea', '#fed6e3'], stops: [0, 100], type: 'linear', angle: 90, name: 'Cotton Candy' },
    // Nature Inspired
    { colors: ['#4facfe', '#00f2fe'], stops: [0, 100], type: 'linear', angle: 90, name: 'Azure' },
    { colors: ['#43e97b', '#38f8d0'], stops: [0, 100], type: 'linear', angle: 90, name: 'Tropical' },
    { colors: ['#fa709a', '#fee140'], stops: [0, 100], type: 'linear', angle: 90, name: 'Solar' },
    { colors: ['#cd9cf2', '#f6f3ff'], stops: [0, 100], type: 'linear', angle: 90, name: 'Lavender' },
    // Radial Variants
    { colors: ['#ffffff', '#000000'], stops: [0, 100], type: 'radial', position: { x: 50, y: 50 }, name: 'Spotlight' },
    { colors: ['#ff9966', '#ff5e62'], stops: [0, 100], type: 'radial', position: { x: 50, y: 50 }, name: 'Core' },
    { colors: ['#00c6ff', '#0072ff'], stops: [0, 100], type: 'radial', position: { x: 50, y: 50 }, name: 'Oceanic' },
    { colors: ['#6a11cb', '#2575fc'], stops: [0, 100], type: 'radial', position: { x: 50, y: 50 }, name: 'Galaxy' },
];

const ColorPanel = ({
    pages,
    currentPage,
    updateElement,
    selectedElement,
    selectedElementData,
    lastColorChange,
    setLastColorChange,
    setPages,
    updatePageBackground
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('main'); // 'main', 'default_solids', 'default_gradients'
    const [photoColors, setPhotoColors] = useState([]);
    const [brandKits, setBrandKits] = useState([]);
    const [openBrandSections, setOpenBrandSections] = useState({});

    // Fetch brand kits from localStorage
    useEffect(() => {
        const savedKits = JSON.parse(localStorage.getItem('sowntra_brand_kits') || '[]');
        setBrandKits(savedKits);

        // Open the first kit by default
        if (savedKits.length > 0) {
            setOpenBrandSections({ [savedKits[0].id]: true });
        }
    }, []);

    // Extract all colors currently in the document
    const documentColors = useMemo(() => {
        const colors = new Set();
        pages.forEach(page => {
            if (page.backgroundColor && page.backgroundColor.startsWith('#')) colors.add(page.backgroundColor);
            page.elements.forEach(el => {
                if (el.color && el.type === 'text') colors.add(el.color);
                if (el.fill && el.type !== 'text' && el.fillType === 'solid') colors.add(el.fill);
            });
        });
        return Array.from(colors).filter(c => c && c.startsWith('#'));
    }, [pages]);

    // Photo Color Extraction Logic
    useEffect(() => {
        const getProminentColors = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = src;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 50;
                    canvas.height = 50;
                    ctx.drawImage(img, 0, 0, 50, 50);
                    const imageData = ctx.getImageData(0, 0, 50, 50).data;

                    const colors = {};
                    for (let i = 0; i < imageData.length; i += 4) {
                        if (imageData[i + 3] < 128) continue; // Skip transparent
                        const rgb = `${imageData[i]},${imageData[i + 1]},${imageData[i + 2]}`;
                        colors[rgb] = (colors[rgb] || 0) + 1;
                    }

                    const sorted = Object.entries(colors)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([rgb]) => {
                            const [r, g, b] = rgb.split(',').map(Number);
                            return rgbToHex(r, g, b);
                        });
                    resolve(sorted);
                };
                img.onerror = () => resolve([]);
            });
        };

        const extractPhotoColors = async () => {
            const allImages = [];
            pages.forEach(page => {
                page.elements.forEach(el => {
                    if (el.type === 'image' && el.src) {
                        allImages.push({ id: el.id, src: el.src });
                    }
                });
            });

            if (allImages.length === 0) {
                setPhotoColors([]);
                return;
            }

            const results = await Promise.all(allImages.map(async (img) => {
                try {
                    const colors = await getProminentColors(img.src);
                    return { src: img.src, colors };
                } catch (e) {
                    console.error("Failed to extract colors from image", e);
                    return null;
                }
            }));

            setPhotoColors(results.filter(Boolean));
        };

        extractPhotoColors();
    }, [pages]);

    const rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const handleColorSelect = (color) => {
        if (!selectedElementData) {
            const oldColor = (pages.find(p => p.id === currentPage) || {}).backgroundColor || '#ffffff';
            if (oldColor !== color) {
                setLastColorChange({
                    oldColor,
                    newColor: color,
                    property: 'backgroundColor'
                });
            }
            updatePageBackground(color);
            return;
        }

        const property = selectedElementData.type === 'text' ? 'color' : 'fill';
        const oldColor = selectedElementData[property];

        if (oldColor !== color) {
            setLastColorChange({
                oldColor,
                newColor: color,
                property
            });
        }

        updateElement(selectedElement, {
            [property]: color,
            fillType: 'solid'
        });
    };

    const handleGradientSelect = (gradient) => {
        const cssString = `linear-gradient(${gradient.angle}deg, ${gradient.colors[0]} ${gradient.stops[0]}%, ${gradient.colors[1]} ${gradient.stops[1]}%)`;
        if (!selectedElementData) {
            updatePageBackground(cssString, gradient);
            return;
        }
        const property = selectedElementData.type === 'text' ? 'color' : 'fill';

        updateElement(selectedElement, {
            fillType: 'gradient',
            gradient: {
                ...gradient,
                stops: gradient.stops || [0, 100],
                position: { x: 50, y: 50 }
            }
        });
    };

    const canChangeAll = useMemo(() => {
        if (!lastColorChange) return false;
        const { oldColor, property } = lastColorChange;
        let count = 0;
        pages.forEach(page => {
            page.elements.forEach(el => {
                if (el.id !== selectedElement && el[property] === oldColor) count++;
            });
            if (property === 'backgroundColor' && page.backgroundColor === oldColor) count++;
        });
        return count > 0;
    }, [lastColorChange, pages, selectedElement]);

    const handleChangeAll = () => {
        if (!lastColorChange) return;
        const { oldColor, newColor, property: prop } = lastColorChange;

        setPages(prevPages => prevPages.map(page => {
            const updatedPage = { ...page };
            if (prop === 'backgroundColor' && page.backgroundColor === oldColor) {
                updatedPage.backgroundColor = newColor;
            }

            return {
                ...updatedPage,
                elements: page.elements.map(el => {
                    if (el[prop] === oldColor) {
                        return { ...el, [prop]: newColor };
                    }
                    return el;
                })
            };
        }));

        setLastColorChange(null);
    };

    const renderColorGrid = (colors, onClick) => (
        <div className="grid grid-cols-6 gap-2">
            {colors.map((color, i) => (
                <button
                    key={`${color}-${i}`}
                    onClick={() => onClick(color)}
                    className="aspect-square rounded border border-gray-100 shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );

    const renderGradientGrid = (gradients, onClick) => (
        <div className="grid grid-cols-6 gap-2">
            {gradients.map((grad, i) => (
                <button
                    key={i}
                    onClick={() => onClick(grad)}
                    className="aspect-square rounded border border-gray-100 shadow-sm transition-transform hover:scale-110"
                    style={{
                        background: `linear-gradient(${grad.angle}deg, ${grad.colors[0]} ${grad.stops[0]}%, ${grad.colors[1]} ${grad.stops[1]}%)`
                    }}
                />
            ))}
        </div>
    );

    if (view === 'default_solids') {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setView('main')} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-bold text-gray-800">Default solid colours</h3>
                </div>
                <div className="flex-1 overflow-y-auto light-scrollbar space-y-6">
                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Grayscale</h4>
                        {renderColorGrid(GRAYSCALE_PALETTE, handleColorSelect)}
                    </section>
                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pastel</h4>
                        {renderColorGrid(PASTEL_PALETTE, handleColorSelect)}
                    </section>
                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Earthy</h4>
                        {renderColorGrid(EARTHY_PALETTE, handleColorSelect)}
                    </section>
                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vibrant</h4>
                        {renderColorGrid(VIBRANT_PALETTE, handleColorSelect)}
                    </section>
                </div>
            </div>
        );
    }

    if (view === 'default_gradients') {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setView('main')} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-bold text-gray-800">Default gradient colours</h3>
                </div>
                <div className="flex-1 overflow-y-auto light-scrollbar">
                    {renderGradientGrid(CANVAS_GRADIENTS, handleGradientSelect)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Try 'blue' or '#00c4cc'"
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.startsWith('#') && (e.target.value.length === 4 || e.target.value.length === 7)) {
                                handleColorSelect(e.target.value);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto light-scrollbar p-4 space-y-8 pb-24">
                {/* Document Colors */}
                <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider text-[10px]">Document colours</h3>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <button className="w-8 h-8 rounded border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-colors">
                                <Plus size={16} />
                            </button>
                            <input
                                type="color"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                onChange={(e) => handleColorSelect(e.target.value)}
                            />
                        </div>
                        {documentColors.map((color, i) => (
                            <button
                                key={i}
                                onClick={() => handleColorSelect(color)}
                                className="w-8 h-8 rounded border border-gray-100 shadow-sm transition-transform hover:scale-110"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {/* Brand Colors Integration */}
                {brandKits.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Brand kits</h3>
                        </div>

                        {brandKits.map(kit => (
                            <BrandKitPanelSection
                                key={kit.id}
                                title={kit.name}
                                badge="Brand"
                                isOpen={openBrandSections[kit.id]}
                                onToggle={() => setOpenBrandSections(prev => ({ ...prev, [kit.id]: !prev[kit.id] }))}
                            >
                                {kit.colors && kit.colors.length > 0 ? (
                                    renderColorGrid(kit.colors, handleColorSelect)
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic">No colors added to this kit</p>
                                )}
                            </BrandKitPanelSection>
                        ))}
                    </div>
                )}

                {/* Photo Colors */}
                {photoColors.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                            <ImageIcon size={14} className="text-purple-500" />
                            Photo colours
                        </h3>
                        <div className="space-y-4">
                            {photoColors.map((pc, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <img src={pc.src} className="w-10 h-10 rounded object-cover border border-gray-100 shadow-sm" alt="Source" />
                                    <div className="flex flex-wrap gap-1.5 flex-1">
                                        {pc.colors.map((color, j) => (
                                            <button
                                                key={j}
                                                onClick={() => handleColorSelect(color)}
                                                className="w-6 h-6 rounded shadow-sm border border-gray-100 transition-transform hover:scale-110"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Default Solid Colors */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Default solid colours</h3>
                        <button onClick={() => setView('default_solids')} className="text-[10px] text-gray-400 hover:text-purple-600 font-bold transition-colors uppercase">See all</button>
                    </div>
                    {renderColorGrid(CANVAS_COLORS.concat(PASTEL_PALETTE.slice(0, 6)).slice(0, 24), handleColorSelect)}
                </div>

                {/* Default Gradient Colors */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Default gradient colours</h3>
                        <button onClick={() => setView('default_gradients')} className="text-[10px] text-gray-400 hover:text-purple-600 font-bold transition-colors uppercase">See all</button>
                    </div>
                    {renderGradientGrid(CANVAS_GRADIENTS.slice(0, 12), handleGradientSelect)}
                </div>
            </div>

            {/* Change All Button Popup */}
            {lastColorChange && canChangeAll && (
                <div className="absolute bottom-6 left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-6 duration-500 z-50 border-t-4 border-t-purple-600">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Change All</span>
                            <button onClick={() => setLastColorChange(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-inner">
                                <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: lastColorChange.oldColor }} />
                                <span className="mx-3 text-gray-400 font-black">→</span>
                                <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: lastColorChange.newColor }} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">Apply to all matching elements</span>
                        </div>
                        <button
                            onClick={handleChangeAll}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-purple-200 active:scale-95"
                        >
                            Change All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPanel;
