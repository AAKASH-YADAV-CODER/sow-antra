import React, { useState } from 'react';
import {
    X, Trash2, Sparkles, ChevronLeft,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minus,
    Check
} from 'lucide-react';
import { animations, pageAnimations } from '../../../utils/constants';

// ─── Animation metadata: which options each animation supports ───────────────
const ANIMATION_META = {
    rise:         { icon: '⬆️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    pan:          { icon: '↔️', supportsDirection: true,  supportsIntensity: true,  supportsSpeed: true  },
    fade:         { icon: '🌅', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    bounce:       { icon: '🏀', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    typewriter:   { icon: '⌨️', supportsDirection: false, supportsIntensity: false, supportsSpeed: true  },
    tumble:       { icon: '🌀', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    wipe:         { icon: '◀️', supportsDirection: true,  supportsIntensity: false, supportsSpeed: true  },
    pop:          { icon: '🎉', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    zoomIn:       { icon: '🔍', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    zoomOut:      { icon: '🔎', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    flip:         { icon: '🔄', supportsDirection: true,  supportsIntensity: false, supportsSpeed: true  },
    flash:        { icon: '⚡', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    glitch:       { icon: '📡', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    heartbeat:    { icon: '💓', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    wiggle:       { icon: '〰️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    jiggle:       { icon: '🫨', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    shake:        { icon: '📳', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    colorShift:   { icon: '🌈', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    fadeOut:      { icon: '🌑', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    slideInLeft:  { icon: '⬅️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    slideInRight: { icon: '➡️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    slideInUp:    { icon: '⬆️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    slideInDown:  { icon: '⬇️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    slideOutLeft: { icon: '↩️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    slideOutRight:{ icon: '↪️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    spin:         { icon: '🌀', supportsDirection: true,  supportsIntensity: false, supportsSpeed: true  },
    blurIn:       { icon: '🌫️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    flicker:      { icon: '🕯️', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    pulse:        { icon: '💠', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
    rotate:       { icon: '🔃', supportsDirection: true,  supportsIntensity: false, supportsSpeed: true  },
    neon:         { icon: '💡', supportsDirection: false, supportsIntensity: true,  supportsSpeed: true  },
};

const DIRECTION_OPTIONS = {
    pan:    [
        { value: 'left',  label: 'Left',   Icon: ArrowLeft  },
        { value: 'right', label: 'Right',  Icon: ArrowRight },
        { value: 'up',    label: 'Up',     Icon: ArrowUp    },
        { value: 'down',  label: 'Down',   Icon: ArrowDown  },
    ],
    wipe:   [
        { value: 'left',  label: 'Left',   Icon: ArrowLeft  },
        { value: 'right', label: 'Right',  Icon: ArrowRight },
        { value: 'up',    label: 'Up',     Icon: ArrowUp    },
        { value: 'down',  label: 'Down',   Icon: ArrowDown  },
    ],
    flip:   [
        { value: 'horizontal', label: 'Horizontal', Icon: ArrowLeft  },
        { value: 'vertical',   label: 'Vertical',   Icon: ArrowUp    },
    ],
    spin:   [
        { value: 'cw',  label: 'Clockwise',     Icon: ArrowRight },
        { value: 'ccw', label: 'Counter-CW',    Icon: ArrowLeft  },
        { value: 'center', label: 'Full Spin',  Icon: Minus      },
    ],
    rotate: [
        { value: 'cw',  label: 'Clockwise',     Icon: ArrowRight },
        { value: 'ccw', label: 'Counter-CW',    Icon: ArrowLeft  },
    ],
};

// Where the animation starts: Beginning, Middle, End of element's time range
const TIMING_OPTIONS = [
    { value: 'beginning', label: 'Beginning' },
    { value: 'middle',    label: 'Middle'    },
    { value: 'end',       label: 'End'       },
];

const elementAnimationCategories = {
    'Basic':     ['rise', 'pan', 'fade', 'pop', 'wipe', 'typewriter'],
    'Dynamic':   ['bounce', 'tumble', 'zoomIn', 'zoomOut', 'flip', 'spin'],
    'Attention': ['flash', 'pulse', 'heartbeat', 'shake', 'jiggle', 'wiggle', 'glitch', 'colorShift'],
    'Entrance':  ['slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown', 'blurIn'],
    'Exit':      ['fadeOut', 'slideOutLeft', 'slideOutRight'],
};

// ─── Slider component ─────────────────────────────────────────────────────────
const Slider = ({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">{label}</span>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                {value}{unit}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-purple-600"
            style={{ background: `linear-gradient(to right, #9333ea ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%)` }}
        />
    </div>
);

// ─── AnimationPreviewTile ─────────────────────────────────────────────────────
const AnimationTile = ({ animKey, animDef, isActive, isHovered, onHover, onClick }) => {
    const meta = ANIMATION_META[animKey] || {};
    return (
        <div
            className="group cursor-pointer flex flex-col items-center gap-1.5"
            onMouseEnter={() => onHover(animKey)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(animKey)}
        >
            <div className={`
                w-full aspect-square rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all relative
                ${isActive
                    ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-400 hover:shadow-md'}
            `}>
                <span className="text-2xl select-none"
                    style={{ animation: isHovered ? `${animKey} 0.8s ease-in-out infinite alternate` : 'none' }}>
                    {meta.icon || '✨'}
                </span>
                {isActive && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                )}
            </div>
            <span className={`text-[10px] text-center font-semibold leading-tight transition-colors
                ${isActive ? 'text-purple-600' : 'text-gray-600 group-hover:text-purple-600'}`}>
                {animDef?.name || animKey}
            </span>
        </div>
    );
};

// ─── Main AnimationPanel ──────────────────────────────────────────────────────
const AnimationPanel = ({
    isOpen,
    onClose,
    selectedElement,
    selectedElements,
    elements,
    updateElement,
    updateElements,
    mode = 'element',
}) => {
    const [hoveredAnim, setHoveredAnim] = useState(null);
    const [selectedAnim, setSelectedAnim] = useState(null); // currently being configured

    // Per-animation settings state
    const [animSettings, setAnimSettings] = useState({
        direction: 'left',
        intensity: 50,
        speed: 50,       // maps to duration (0–100 → 2s–0.2s reversed)
        timing: 'beginning',
    });

    if (!isOpen) return null;

    // ── Derive current element's animation ──────────────────────────────────
    const primaryId = selectedElement || (selectedElements?.size > 0 ? [...selectedElements][0] : null);
    const primaryEl = elements?.find(el => el.id === primaryId);
    const currentAnim = primaryEl?.animation?.type || null;

    const speedToDuration = (s) => parseFloat((2 - (s / 100) * 1.8).toFixed(2)); // 0→2s, 100→0.2s

    // ── Timing → startTime mapping ───────────────────────────────────────────
    // CanvasElement uses element.startTime + pageStartTime for animation sync.
    // 'beginning' = starts at 0s
    // 'middle'    = starts at (pageDuration/2 - animDuration/2)
    // 'end'       = starts at (pageDuration - animDuration)
    const getStartTime = (timing, duration) => {
        const pageDuration = 5; // Default page duration in seconds
        if (timing === 'middle') return Math.max(0, pageDuration / 2 - duration / 2);
        if (timing === 'end')    return Math.max(0, pageDuration - duration);
        return 0; // 'beginning'
    };

    // ── Apply animation ──────────────────────────────────────────────────────
    const handleApplyAnimation = (animKey) => {
        const duration = speedToDuration(animSettings.speed);

        if (mode === 'page') {
            const preset = pageAnimations[animKey];
            if (!preset) return;
            const sorted = [...elements].sort((a, b) => {
                const dy = a.y - b.y;
                return Math.abs(dy) > 10 ? dy : a.x - b.x;
            });
            const updates = sorted.map((el, idx) => {
                let recipe = preset.recipes.default;
                if (el.type === 'text') recipe = preset.recipes.text;
                else if (el.type === 'image') recipe = preset.recipes.image;
                else if (['rectangle', 'circle', 'triangle', 'star', 'shape'].includes(el.type)) recipe = preset.recipes.shape;
                return {
                    id: el.id,
                    updates: {
                        animation: {
                            type: recipe.type,
                            duration: recipe.duration,
                            delay: idx * preset.stagger,
                            iteration: 1,
                            lastApplied: Date.now(),
                        },
                        startTime: idx * preset.stagger // stagger via startTime for timeline sync
                    }
                };
            });
            if (typeof updateElements === 'function') updateElements(updates);
            else elements.forEach(el => updateElement(el.id, updates.find(u => u.id === el.id).updates, false));
        } else {
            const startTime = getStartTime(animSettings.timing, duration);
            // End = reverse direction (exit animation)
            // Middle = looping emphasis
            // Beginning = normal entrance
            const animationDirection = animSettings.timing === 'end' ? 'reverse' : 'normal';
            const iteration = animSettings.timing === 'middle' ? 'infinite' : 1;

            const targetIds = selectedElement ? [selectedElement] : Array.from(selectedElements || []);
            targetIds.forEach(id => {
                updateElement(id, {
                    startTime,
                    animation: {
                        type: animKey,
                        duration,
                        iteration,
                        animationDirection,  // 'normal' for enter, 'reverse' for exit
                        direction: animSettings.direction,
                        intensity: animSettings.intensity,
                        lastApplied: Date.now(),
                    }
                });
            });
        }
    };

    const handleSelectAnim = (key) => {
        setSelectedAnim(key);
        handleApplyAnimation(key);
    };

    const handleUpdateSetting = (field, val) => {
        const updated = { ...animSettings, [field]: val };
        setAnimSettings(updated);

        // Re-apply live with correct startTime
        if (selectedAnim && mode !== 'page') {
            const duration = speedToDuration(updated.speed);
            const startTime = getStartTime(updated.timing, duration);
            const animationDirection = updated.timing === 'end' ? 'reverse' : 'normal';
            const iteration = updated.timing === 'middle' ? 'infinite' : 1;
            const targetIds = selectedElement ? [selectedElement] : Array.from(selectedElements || []);
            targetIds.forEach(id => {
                updateElement(id, {
                    startTime,
                    animation: {
                        type: selectedAnim,
                        duration,
                        iteration,
                        animationDirection,
                        direction: updated.direction,
                        intensity: updated.intensity,
                        lastApplied: Date.now(),
                    }
                });
            });
        }
    };

    const handleRemoveAnimation = () => {
        setSelectedAnim(null);
        if (mode === 'page') {
            const updates = elements.map(el => ({ id: el.id, updates: { animation: null } }));
            if (typeof updateElements === 'function') updateElements(updates);
            else elements.forEach(el => updateElement(el.id, { animation: null }, false));
        } else {
            const targetIds = selectedElement ? [selectedElement] : Array.from(selectedElements || []);
            targetIds.forEach(id => updateElement(id, { animation: null }));
        }
    };

    const meta = selectedAnim ? (ANIMATION_META[selectedAnim] || {}) : null;
    const directionOptions = selectedAnim ? (DIRECTION_OPTIONS[selectedAnim] || null) : null;

    return (
        <div className="absolute left-[72px] top-[64px] bottom-0 w-80 bg-white shadow-2xl z-[100] flex flex-col border-r border-gray-200"
            style={{ animation: 'slideInFromLeft 0.25s ease-out' }}>

            {/* ── Header ────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                {selectedAnim ? (
                    <button
                        onClick={() => setSelectedAnim(null)}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors font-semibold text-sm"
                    >
                        <ChevronLeft size={18} />
                        <span>Animations</span>
                    </button>
                ) : (
                    <h2 className="font-bold text-gray-800">
                        {mode === 'page' ? 'Page Animations' : 'Animate'}
                    </h2>
                )}
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto light-scrollbar">

                {/* ═══ DETAIL VIEW (animation selected) ═══ */}
                {selectedAnim && mode !== 'page' ? (
                    <div className="p-4 space-y-5">

                        {/* Selected animation header */}
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <span className="text-3xl">{meta.icon}</span>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{animations[selectedAnim]?.name}</p>
                                <p className="text-[10px] text-purple-600 font-medium">Currently applied</p>
                            </div>
                        </div>

                        {/* Direction */}
                        {meta.supportsDirection && directionOptions && (
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Direction</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {directionOptions.map(({ value, label, Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => handleUpdateSetting('direction', value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all
                                                ${animSettings.direction === value
                                                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600'}`}
                                        >
                                            <Icon size={14} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timing (Beginning / Middle / End) */}
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">When</p>
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                                {TIMING_OPTIONS.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleUpdateSetting('timing', value)}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all
                                            ${animSettings.timing === value
                                                ? 'bg-white text-purple-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Intensity */}
                        {meta.supportsIntensity && (
                            <Slider
                                label="Intensity"
                                value={animSettings.intensity}
                                min={0}
                                max={100}
                                onChange={v => handleUpdateSetting('intensity', v)}
                            />
                        )}

                        {/* Speed */}
                        {meta.supportsSpeed && (
                            <Slider
                                label="Speed"
                                value={animSettings.speed}
                                min={0}
                                max={100}
                                onChange={v => handleUpdateSetting('speed', v)}
                                unit=""
                            />
                        )}

                        {/* Duration display */}
                        <div className="flex justify-between items-center text-[10px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                            <span>Duration</span>
                            <span className="font-bold text-gray-600">{speedToDuration(animSettings.speed)}s</span>
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={handleRemoveAnimation}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold"
                        >
                            <Trash2 size={15} />
                            Remove animation
                        </button>
                    </div>

                ) : (
                    /* ═══ LIST VIEW ═══ */
                    <div className="p-4 space-y-5">

                        {/* Remove all */}
                        {currentAnim && (
                            <button
                                onClick={handleRemoveAnimation}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold"
                            >
                                <Trash2 size={15} />
                                Remove all animations
                            </button>
                        )}

                        {mode === 'page' ? (
                            /* Page Animations Grid */
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(pageAnimations).map(([key, preset]) => (
                                    <div
                                        key={key}
                                        onClick={() => handleApplyAnimation(key)}
                                        onMouseEnter={() => setHoveredAnim(key)}
                                        onMouseLeave={() => setHoveredAnim(null)}
                                        className={`cursor-pointer flex flex-col gap-2 p-3 bg-white rounded-xl border-2 transition-all
                                            ${hoveredAnim === key
                                                ? 'border-purple-500 shadow-md shadow-purple-100'
                                                : 'border-gray-200 hover:border-purple-300'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                                <Sparkles size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">{preset.name}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-tight">{preset.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Element Animations by category */
                            Object.entries(elementAnimationCategories).map(([category, animKeys]) => (
                                <div key={category}>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-0.5">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {animKeys.map(key => {
                                            const animDef = animations[key];
                                            if (!animDef && !ANIMATION_META[key]) return null;
                                            return (
                                                <AnimationTile
                                                    key={key}
                                                    animKey={key}
                                                    animDef={animDef}
                                                    isActive={currentAnim === key}
                                                    isHovered={hoveredAnim === key}
                                                    onHover={setHoveredAnim}
                                                    onClick={(k) => {
                                                        handleSelectAnim(k);
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Tip */}
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                            <p className="font-bold mb-1">💡 Tip</p>
                            Click any animation to apply and customise its direction, timing, intensity & speed.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimationPanel;
