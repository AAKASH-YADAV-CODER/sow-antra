import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Upload as UploadIcon, Check, Sparkles, RotateCcw, ZoomIn, Sun, Contrast, Focus, Eraser, ArrowUpCircle, ChevronDown } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   IMAGE PROCESSING ALGORITHMS
   ══════════════════════════════════════════════════════════════ */

/**
 * Bilinear Interpolation Upscale
 * Smoothly scales an image up by sampling 4 neighboring pixels
 * and blending based on sub-pixel position. Produces clean,
 * anti-aliased upscale suitable for further sharpening.
 */
function bilinearUpscale(srcData, srcW, srcH, dstW, dstH) {
    const dst = new Uint8ClampedArray(dstW * dstH * 4);
    const xRatio = (srcW - 1) / Math.max(1, dstW - 1);
    const yRatio = (srcH - 1) / Math.max(1, dstH - 1);

    for (let y = 0; y < dstH; y++) {
        const srcY = y * yRatio;
        const yFloor = Math.floor(srcY);
        const yCeil = Math.min(yFloor + 1, srcH - 1);
        const yLerp = srcY - yFloor;

        for (let x = 0; x < dstW; x++) {
            const srcX = x * xRatio;
            const xFloor = Math.floor(srcX);
            const xCeil = Math.min(xFloor + 1, srcW - 1);
            const xLerp = srcX - xFloor;

            const di = (y * dstW + x) * 4;

            // 4 source pixels
            const tl = (yFloor * srcW + xFloor) * 4;
            const tr = (yFloor * srcW + xCeil) * 4;
            const bl = (yCeil * srcW + xFloor) * 4;
            const br = (yCeil * srcW + xCeil) * 4;

            for (let c = 0; c < 4; c++) {
                const top = srcData[tl + c] * (1 - xLerp) + srcData[tr + c] * xLerp;
                const bot = srcData[bl + c] * (1 - xLerp) + srcData[br + c] * xLerp;
                dst[di + c] = top * (1 - yLerp) + bot * yLerp;
            }
        }
    }
    return dst;
}

/**
 * Unsharp Mask Sharpening
 * Creates a blurred version, then amplifies the difference (high-frequency detail)
 * between original and blur. This recovers fine detail lost in low-res images.
 * 
 * amount: 0-300 (typical: 100-200)
 * radius: blur kernel radius (1-5)
 * threshold: min difference to sharpen (noise gate)
 */
function unsharpMask(data, w, h, amount = 150, radius = 2, threshold = 5) {
    const factor = amount / 100.0;
    const size = 2 * radius + 1;
    const kernel = new Float32Array(size * size);
    let kSum = 0;
    const sigma = radius / 2.0;
    const s2 = 2 * sigma * sigma;

    // Gaussian kernel
    for (let ky = 0; ky < size; ky++) {
        for (let kx = 0; kx < size; kx++) {
            const dy = ky - radius, dx = kx - radius;
            const v = Math.exp(-(dx * dx + dy * dy) / s2);
            kernel[ky * size + kx] = v;
            kSum += v;
        }
    }
    for (let i = 0; i < kernel.length; i++) kernel[i] /= kSum;

    // Blur pass
    const blurred = new Float32Array(w * h * 4);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const pi = (y * w + x) * 4;
            let r = 0, g = 0, b = 0;
            let ki = 0;
            for (let ky = 0; ky < size; ky++) {
                const ny = Math.max(0, Math.min(h - 1, y - radius + ky));
                for (let kx = 0; kx < size; kx++) {
                    const nx = Math.max(0, Math.min(w - 1, x - radius + kx));
                    const ni = (ny * w + nx) * 4;
                    const wt = kernel[ki];
                    r += data[ni] * wt;
                    g += data[ni + 1] * wt;
                    b += data[ni + 2] * wt;
                    ki++;
                }
            }
            blurred[pi] = r;
            blurred[pi + 1] = g;
            blurred[pi + 2] = b;
        }
    }

    // Unsharp = original + factor * (original - blur)
    const out = new Uint8ClampedArray(data.length);
    for (let i = 0; i < w * h; i++) {
        const pi = i * 4;
        for (let c = 0; c < 3; c++) {
            const diff = data[pi + c] - blurred[pi + c];
            if (Math.abs(diff) > threshold) {
                out[pi + c] = Math.max(0, Math.min(255, data[pi + c] + diff * factor));
            } else {
                out[pi + c] = data[pi + c];
            }
        }
        out[pi + 3] = data[pi + 3]; // alpha
    }
    return out;
}

/**
 * Adaptive Smart Denoise
 * Uses a simplified bilateral-like approach:
 * Only averages nearby pixels that are color-similar,
 * removing noise while preserving edges and detail.
 */
function smartDenoise(data, w, h, strength = 30) {
    const radius = 2;
    const size = 2 * radius + 1;
    const colorThreshold = strength;
    const out = new Uint8ClampedArray(data.length);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const ci = (y * w + x) * 4;
            const cr = data[ci], cg = data[ci + 1], cb = data[ci + 2];
            let rs = 0, gs = 0, bs = 0, wSum = 0;

            for (let ky = -radius; ky <= radius; ky++) {
                const ny = Math.max(0, Math.min(h - 1, y + ky));
                for (let kx = -radius; kx <= radius; kx++) {
                    const nx = Math.max(0, Math.min(w - 1, x + kx));
                    const ni = (ny * w + nx) * 4;
                    const diff = Math.abs(cr - data[ni]) + Math.abs(cg - data[ni + 1]) + Math.abs(cb - data[ni + 2]);
                    if (diff < colorThreshold * 3) {
                        const wt = 1.0 / (1.0 + diff / colorThreshold);
                        rs += data[ni] * wt;
                        gs += data[ni + 1] * wt;
                        bs += data[ni + 2] * wt;
                        wSum += wt;
                    }
                }
            }
            out[ci] = rs / wSum;
            out[ci + 1] = gs / wSum;
            out[ci + 2] = bs / wSum;
            out[ci + 3] = data[ci + 3];
        }
    }
    return out;
}

/**
 * Brightness & Contrast adjustment.
 * contrast: -100 to +100
 * brightness: -100 to +100
 */
function adjustBrightnessContrast(data, brightness = 0, contrast = 0) {
    const out = new Uint8ClampedArray(data.length);
    const bFactor = brightness * 2.55; // map -100..100 → -255..255
    const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            let val = data[i + c];
            val += bFactor;
            val = cFactor * (val - 128) + 128;
            out[i + c] = Math.max(0, Math.min(255, val));
        }
        out[i + 3] = data[i + 3];
    }
    return out;
}

/**
 * Auto Levels / Auto White Balance
 * Stretches each channel histogram independently so that
 * the darkest 0.5% maps to 0 and brightest 0.5% maps to 255.
 */
function autoLevels(data, w, h) {
    const out = new Uint8ClampedArray(data.length);
    const pixelCount = w * h;
    const clipPercent = 0.005; // 0.5%
    const clipCount = Math.floor(pixelCount * clipPercent);

    for (let ch = 0; ch < 3; ch++) {
        // Build histogram
        const hist = new Uint32Array(256);
        for (let i = 0; i < pixelCount; i++) {
            hist[data[i * 4 + ch]]++;
        }
        // Find clip low
        let low = 0, count = 0;
        for (let v = 0; v < 256; v++) {
            count += hist[v];
            if (count >= clipCount) { low = v; break; }
        }
        // Find clip high
        let high = 255;
        count = 0;
        for (let v = 255; v >= 0; v--) {
            count += hist[v];
            if (count >= clipCount) { high = v; break; }
        }

        const range = Math.max(1, high - low);
        for (let i = 0; i < pixelCount; i++) {
            out[i * 4 + ch] = Math.max(0, Math.min(255, Math.round(((data[i * 4 + ch] - low) / range) * 255)));
        }
    }
    // Copy alpha
    for (let i = 0; i < pixelCount; i++) {
        out[i * 4 + 3] = data[i * 4 + 3];
    }
    return out;
}

/**
 * Color Vibrance boost (more nuanced than raw saturation).
 * Only increases saturation of less-saturated colors,
 * avoids oversaturating already vivid areas.
 */
function vibranceBoost(data, amount = 30) {
    const out = new Uint8ClampedArray(data.length);
    const amt = amount / 100.0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const avg = (r + g + b) / 3;
        const saturation = (max === 0) ? 0 : (max - min) / max;

        // Lower saturation pixels get more boost
        const boostFactor = amt * (1 - saturation) * 2;

        out[i] = Math.max(0, Math.min(255, r + (r - avg) * boostFactor));
        out[i + 1] = Math.max(0, Math.min(255, g + (g - avg) * boostFactor));
        out[i + 2] = Math.max(0, Math.min(255, b + (b - avg) * boostFactor));
        out[i + 3] = data[i + 3];
    }
    return out;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */

export const PhotoEnhancerPanel = ({
    isOpen, onClose,
    selectedElement, selectedElementData,
    updateElement, addElement,
}) => {
    const [originalSrc, setOriginalSrc] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [processTime, setProcessTime] = useState(null);

    // Enhancement controls
    const [upscaleLevel, setUpscaleLevel] = useState(2);    // 1x, 2x, 4x
    const [sharpness, setSharpness] = useState(60);          // 0-100
    const [denoise, setDenoise] = useState(25);              // 0-100
    const [brightness, setBrightness] = useState(5);         // -50 to +50
    const [contrast, setContrast] = useState(10);            // -50 to +50
    const [vibrance, setVibrance] = useState(15);            // 0-100
    const [autoLevel, setAutoLevel] = useState(true);        // auto levels toggle
    const [activePreset, setActivePreset] = useState('balanced');  

    const fileRef = useRef(null);
    const imgRef = useRef(null);
    const dimsRef = useRef({ w: 400, h: 400 });
    const debounceRef = useRef(null);

    /* Auto-load selected canvas image */
    useEffect(() => {
        if (selectedElementData?.type === 'image' && !originalSrc && !isProcessing)
            loadSrc(selectedElementData.originalSrc || selectedElementData.src);
    }, [selectedElementData]);

    const loadSrc = (src) => { setOriginalSrc(src); setPreviewSrc(src); imgRef.current = null; };

    const handleFileUpload = (e) => {
        const f = e.target.files?.[0];
        if (f) { loadSrc(URL.createObjectURL(f)); e.target.value = ''; }
    };

    /* Debounced processing when any control changes */
    useEffect(() => {
        if (!originalSrc) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(runProcess, 500);
        return () => clearTimeout(debounceRef.current);
    }, [originalSrc, upscaleLevel, sharpness, denoise, brightness, contrast, vibrance, autoLevel]);

    const runProcess = useCallback(async () => {
        setIsProcessing(true);
        const startTime = performance.now();
        try {
            /* ── 1. Load image ── */
            if (!imgRef.current) {
                setStatusMsg('Loading image…');
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = originalSrc; });
                imgRef.current = img;
            }
            const img = imgRef.current;

            /* ── 2. Get original dimensions ── */
            const origW = img.naturalWidth || img.width;
            const origH = img.naturalHeight || img.height;

            // Work at a reasonable processing size for preview (max 500px)
            const PREV_MAX = 500;
            let workW = origW, workH = origH;
            if (workW > PREV_MAX || workH > PREV_MAX) {
                const ratio = Math.min(PREV_MAX / workW, PREV_MAX / workH);
                workW = Math.round(workW * ratio);
                workH = Math.round(workH * ratio);
            }

            /* ── 3. Draw source at working resolution ── */
            const cvs = document.createElement('canvas');
            cvs.width = workW; cvs.height = workH;
            const ctx = cvs.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, workW, workH);
            let pixels = ctx.getImageData(0, 0, workW, workH).data;

            /* ── 4. Auto Levels (color correction) ── */
            if (autoLevel) {
                setStatusMsg('Auto-correcting colors…');
                await new Promise(r => setTimeout(r, 0));
                pixels = autoLevels(pixels, workW, workH);
            }

            /* ── 5. Denoise (before sharpening to avoid amplifying noise) ── */
            if (denoise > 5) {
                setStatusMsg('Removing noise…');
                await new Promise(r => setTimeout(r, 0));
                pixels = smartDenoise(pixels, workW, workH, denoise);
            }

            /* ── 6. Brightness & Contrast ── */
            if (brightness !== 0 || contrast !== 0) {
                setStatusMsg('Adjusting tones…');
                await new Promise(r => setTimeout(r, 0));
                pixels = adjustBrightnessContrast(pixels, brightness, contrast);
            }

            /* ── 7. Vibrance boost ── */
            if (vibrance > 0) {
                setStatusMsg('Enhancing colors…');
                await new Promise(r => setTimeout(r, 0));
                pixels = vibranceBoost(pixels, vibrance);
            }

            /* ── 8. Upscale ── */
            let outW = workW, outH = workH;
            if (upscaleLevel > 1) {
                setStatusMsg(`Upscaling ${upscaleLevel}x…`);
                await new Promise(r => setTimeout(r, 0));
                outW = workW * upscaleLevel;
                outH = workH * upscaleLevel;
                // Cap at 2000px for preview performance
                const maxOut = 2000;
                if (outW > maxOut || outH > maxOut) {
                    const r = Math.min(maxOut / outW, maxOut / outH);
                    outW = Math.round(outW * r);
                    outH = Math.round(outH * r);
                }
                pixels = bilinearUpscale(pixels, workW, workH, outW, outH);
            }

            /* ── 9. Sharpen (after upscale for crispness) ── */
            if (sharpness > 5) {
                setStatusMsg('Sharpening details…');
                await new Promise(r => setTimeout(r, 0));
                const sharpAmount = 50 + (sharpness * 2); // 50-250
                const sharpRadius = sharpness > 60 ? 3 : 2;
                pixels = unsharpMask(pixels, outW, outH, sharpAmount, sharpRadius, 3);
            }

            /* ── 10. Write output ── */
            setStatusMsg('Finalizing…');
            const outCvs = document.createElement('canvas');
            outCvs.width = outW; outCvs.height = outH;
            outCvs.getContext('2d').putImageData(new ImageData(pixels, outW, outH), 0, 0);

            // Store dims for add to canvas
            const fitR = Math.min(500 / outW, 500 / outH, 1);
            dimsRef.current = { w: Math.round(outW * fitR), h: Math.round(outH * fitR) };

            setPreviewSrc(outCvs.toDataURL('image/png', 0.95));
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
            setProcessTime(elapsed);
            setStatusMsg('');

        } catch (e) {
            console.error('PhotoEnhancerPanel:', e);
            setStatusMsg('Error – try another image');
        } finally {
            setIsProcessing(false);
        }
    }, [originalSrc, upscaleLevel, sharpness, denoise, brightness, contrast, vibrance, autoLevel]);

    /* Add / update canvas element */
    const handleAction = () => {
        if (!previewSrc || previewSrc === originalSrc) return;
        const { w, h } = dimsRef.current;
        if (selectedElementData?.type === 'image') {
            updateElement(selectedElement, {
                src: previewSrc, originalSrc,
                width: selectedElementData.width || w,
                height: selectedElementData.height || h,
            });
        } else {
            addElement('image', { src: previewSrc, width: w, height: h, originalSrc });
        }
        onClose();
    };

    if (!isOpen) return null;

    /* ── Presets ── */
    const presets = {
        balanced: { label: '⚡ Balanced', upscaleLevel: 2, sharpness: 60, denoise: 25, brightness: 5, contrast: 10, vibrance: 15, autoLevel: true },
        maxQuality: { label: '💎 Max Quality', upscaleLevel: 4, sharpness: 80, denoise: 40, brightness: 8, contrast: 15, vibrance: 25, autoLevel: true },
        lightFix: { label: '🌤️ Light Fix', upscaleLevel: 1, sharpness: 40, denoise: 15, brightness: 10, contrast: 5, vibrance: 10, autoLevel: true },
        portrait: { label: '👤 Portrait', upscaleLevel: 2, sharpness: 45, denoise: 50, brightness: 8, contrast: 8, vibrance: 20, autoLevel: true },
        landscape: { label: '🏔️ Landscape', upscaleLevel: 2, sharpness: 75, denoise: 20, brightness: 5, contrast: 18, vibrance: 30, autoLevel: true },
    };

    const applyPreset = (key) => {
        const p = presets[key];
        setActivePreset(key);
        setUpscaleLevel(p.upscaleLevel);
        setSharpness(p.sharpness);
        setDenoise(p.denoise);
        setBrightness(p.brightness);
        setContrast(p.contrast);
        setVibrance(p.vibrance);
        setAutoLevel(p.autoLevel);
    };

    /* Slider Row Component */
    const SliderRow = ({ icon: Icon, label, value, onChange, min = 0, max = 100, unit = '', color = '#8b5cf6', disabled = false }) => (
        <div className={`space-y-2 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon size={13} style={{ color }} />
                    {label}
                </label>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: color + '15', color }}>{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} step="1" value={value}
                onChange={e => onChange(+e.target.value)}
                className="w-full h-1.5 rounded-full cursor-pointer"
                style={{ accentColor: color }} />
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white select-none">

            {/* ── Header ── */}
            <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                        <Sparkles size={15} color="#fff" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">Photo Enhancer</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">AI-powered upscale & enhance</p>
                    </div>
                </div>
                <button onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-violet-100 transition-colors text-gray-400 hover:text-gray-700">
                    <X size={15} />
                </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto light-scrollbar">
                <input type="file" ref={fileRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                {!originalSrc ? (
                    /* Upload zone */
                    <div onClick={() => fileRef.current?.click()}
                        className="m-4 rounded-2xl border-2 border-dashed border-violet-200 hover:border-violet-400 bg-violet-50 hover:bg-violet-100 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-12">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center relative">
                            <UploadIcon size={24} className="text-violet-500" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                                <ArrowUpCircle size={12} className="text-white" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-800">Upload Low Quality Photo</p>
                            <p className="text-[11px] text-gray-500 mt-1">JPG, PNG – We'll enhance it to HD</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {['2x', '4x'].map(tag => (
                                <span key={tag} className="px-2.5 py-1 bg-white rounded-full text-[10px] font-bold text-violet-600 shadow-sm border border-violet-100">
                                    {tag} Upscale
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">

                        {/* ── Before/After Preview ── */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-[#1a1a2e] group"
                            style={{ aspectRatio: '4/3' }}>
                            <img src={previewSrc} alt="preview"
                                className="w-full h-full object-contain transition-opacity duration-300"
                                style={{ opacity: isProcessing ? 0.2 : 1 }} />

                            {isProcessing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    {/* Animated processing ring */}
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-violet-200/30 border-t-violet-500 animate-spin" />
                                        <Sparkles size={20} className="absolute inset-0 m-auto text-violet-400 animate-pulse" />
                                    </div>
                                    <p className="text-[11px] font-bold text-violet-300 tracking-widest uppercase">
                                        {statusMsg || 'Enhancing…'}
                                    </p>
                                </div>
                            )}

                            {!isProcessing && (
                                <>
                                    {/* Top actions */}
                                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => fileRef.current?.click()}
                                            className="px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white hover:bg-black/80 flex items-center gap-1">
                                            <UploadIcon size={10} /> Change
                                        </button>
                                        <button
                                            onClick={() => { setOriginalSrc(null); setPreviewSrc(null); imgRef.current = null; setProcessTime(null); }}
                                            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/80">
                                            <RotateCcw size={10} />
                                        </button>
                                    </div>

                                    {/* Bottom status badge */}
                                    {processTime && (
                                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                            <div className="px-2.5 py-1 bg-violet-600/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                                                <Sparkles size={10} />
                                                Enhanced in {processTime}s
                                            </div>
                                            <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white">
                                                {upscaleLevel}x Upscale
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* ── Quick Presets ── */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Presets</p>
                            <div className="grid grid-cols-3 gap-1.5">
                                {Object.entries(presets).map(([key, p]) => (
                                    <button key={key} onClick={() => applyPreset(key)}
                                        className={`py-2 px-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                                            activePreset === key
                                                ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                                        }`}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Enhancement Controls ── */}
                        <div className={`space-y-4 transition-opacity ${isProcessing ? 'opacity-30 pointer-events-none' : ''}`}>

                            {/* Upscale Level */}
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 space-y-3 border border-violet-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <ZoomIn size={13} className="text-violet-600" />
                                        Upscale Resolution
                                    </span>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
                                        {upscaleLevel === 1 ? 'Original' : `${upscaleLevel}× HD`}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 4].map(level => (
                                        <button key={level} onClick={() => { setUpscaleLevel(level); setActivePreset(null); }}
                                            className={`py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                                                upscaleLevel === level
                                                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                                            }`}>
                                            {level === 1 ? '1× Original' : `${level}× Upscale`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sliders */}
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                                <SliderRow icon={Focus} label="Sharpness" value={sharpness}
                                    onChange={v => { setSharpness(v); setActivePreset(null); }}
                                    color="#8b5cf6" />

                                <SliderRow icon={Eraser} label="Denoise" value={denoise}
                                    onChange={v => { setDenoise(v); setActivePreset(null); }}
                                    color="#06b6d4" />

                                <SliderRow icon={Sun} label="Brightness" value={brightness}
                                    onChange={v => { setBrightness(v); setActivePreset(null); }}
                                    min={-50} max={50} color="#f59e0b" />

                                <SliderRow icon={Contrast} label="Contrast" value={contrast}
                                    onChange={v => { setContrast(v); setActivePreset(null); }}
                                    min={-50} max={50} color="#ef4444" />

                                <SliderRow icon={Sparkles} label="Vibrance" value={vibrance}
                                    onChange={v => { setVibrance(v); setActivePreset(null); }}
                                    color="#ec4899" />
                            </div>

                            {/* Auto Levels Toggle */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${autoLevel ? 'bg-violet-500' : 'bg-gray-200'}`}>
                                        {autoLevel && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                                        Auto Color Correction
                                    </span>
                                </div>
                                <button
                                    onClick={() => { setAutoLevel(!autoLevel); setActivePreset(null); }}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${autoLevel ? 'bg-violet-500' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${autoLevel ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* ── CTA Button ── */}
            <div className="shrink-0 p-4 border-t border-gray-100">
                <button onClick={handleAction}
                    disabled={isProcessing || !originalSrc || previewSrc === originalSrc}
                    className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                        background: (isProcessing || !originalSrc || previewSrc === originalSrc)
                            ? '#f3f4f6'
                            : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                        color: (isProcessing || !originalSrc || previewSrc === originalSrc) ? '#9ca3af' : '#fff',
                        boxShadow: (isProcessing || !originalSrc || previewSrc === originalSrc)
                            ? 'none' : '0 4px 20px rgba(139,92,246,.4)',
                        cursor: (isProcessing || !originalSrc || previewSrc === originalSrc) ? 'not-allowed' : 'pointer',
                    }}>
                    {isProcessing
                        ? <><Loader2 size={16} className="animate-spin" />{statusMsg || 'Enhancing…'}</>
                        : !originalSrc ? 'Upload an Image First'
                        : previewSrc === originalSrc ? 'Processing…'
                        : <><Check size={16} />{selectedElementData?.type === 'image' ? 'Update Image' : 'Add to Design'}</>
                    }
                </button>
            </div>
        </div>
    );
};

export default PhotoEnhancerPanel;
