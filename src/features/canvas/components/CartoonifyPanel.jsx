import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, Upload as UploadIcon, Check, Wand2, RotateCcw } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   CORE ALGORITHMS
   ══════════════════════════════════════════════════════════════ */

/**
 * BILATERAL FILTER (the magic ingredient for clean cartoon color areas).
 * Unlike a box/Gaussian blur that blurs across edges, bilateral only
 * averages pixels that are BOTH spatially close AND color-similar.
 * Result: perfectly flat color regions with sharp borders preserved.
 *
 * Perf: pre-computed spatial LUT + color LUT to avoid exp() in hot loop.
 */
function bilateralFilter(srcData, w, h, spatialR = 5, colorSigma = 30) {
    const spSize = 2 * spatialR + 1;
    const spLUT  = new Float32Array(spSize * spSize);
    for (let ky = 0; ky < spSize; ky++) {
        for (let kx = 0; kx < spSize; kx++) {
            const dy = ky - spatialR, dx = kx - spatialR;
            spLUT[ky * spSize + kx] = Math.exp(-(dx * dx + dy * dy) / (2 * spatialR * spatialR));
        }
    }

    // Color weight LUT indexed by sum-of-abs-channel-diffs (0-765)
    const MAX_CDIFF = 765;
    const cLUT = new Float32Array(MAX_CDIFF + 1);
    const cSig2 = 2 * colorSigma * colorSigma;
    for (let d = 0; d <= MAX_CDIFF; d++) {
        const n = d / 3.0; // normalize per-channel
        cLUT[d] = Math.exp(-(n * n) / cSig2);
    }

    const out = new Uint8ClampedArray(srcData.length);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const ci = (y * w + x) * 4;
            const cr = srcData[ci], cg = srcData[ci + 1], cb = srcData[ci + 2];
            let rs = 0.0, gs = 0.0, bs = 0.0, ws = 0.0;
            let ki = 0;
            for (let ky = 0; ky < spSize; ky++) {
                const ny = Math.max(0, Math.min(h - 1, y - spatialR + ky));
                for (let kx = 0; kx < spSize; kx++) {
                    const nx  = Math.max(0, Math.min(w - 1, x - spatialR + kx));
                    const ni  = (ny * w + nx) * 4;
                    const cd  = Math.min(MAX_CDIFF, Math.abs(cr - srcData[ni]) + Math.abs(cg - srcData[ni + 1]) + Math.abs(cb - srcData[ni + 2]));
                    const wij = spLUT[ki] * cLUT[cd];
                    rs += srcData[ni]     * wij;
                    gs += srcData[ni + 1] * wij;
                    bs += srcData[ni + 2] * wij;
                    ws += wij;
                    ki++;
                }
            }
            out[ci]     = rs / ws;
            out[ci + 1] = gs / ws;
            out[ci + 2] = bs / ws;
            out[ci + 3] = srcData[ci + 3];
        }
    }
    return out;
}

/**
 * Posterize: snap each channel to `levels` discrete steps.
 * Creates the flat-fill regions typical in comics.
 */
function posterize(data, levels) {
    const step = 255 / (levels - 1);
    for (let i = 0; i < data.length; i += 4) {
        data[i]     = Math.round(Math.round(data[i]     / step) * step);
        data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
        data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
    }
}

/**
 * Boost saturation of each pixel via HSL conversion.
 * Makes cartoon colors vivid and punchy.
 */
function boostSaturation(data, factor = 1.5) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l   = (max + min) / 2;
        const d   = max - min;
        if (d < 0.005) continue; // grey – skip

        let h = 0;
        if (max === r)      h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else                h = (r - g) / d + 4;
        h = h * 60; if (h < 0) h += 360;

        const s  = d / (1 - Math.abs(2 * l - 1));
        const s2 = Math.min(1, s * factor);
        const c  = (1 - Math.abs(2 * l - 1)) * s2;
        const x  = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m  = l - c / 2;
        let r2 = 0, g2 = 0, b2 = 0;
        if      (h < 60)  { r2 = c; g2 = x; }
        else if (h < 120) { r2 = x; g2 = c; }
        else if (h < 180) { g2 = c; b2 = x; }
        else if (h < 240) { g2 = x; b2 = c; }
        else if (h < 300) { r2 = x; b2 = c; }
        else              { r2 = c; b2 = x; }
        data[i]     = Math.round((r2 + m) * 255);
        data[i + 1] = Math.round((g2 + m) * 255);
        data[i + 2] = Math.round((b2 + m) * 255);
    }
}

/** Sobel magnitude (Float32 per pixel). */
function sobelMag(gray, w, h) {
    const mag = new Float32Array(w * h);
    const gp  = (x, y) => gray[Math.max(0, Math.min(h - 1, y)) * w + Math.max(0, Math.min(w - 1, x))];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const gx =
                -gp(x-1,y-1) + gp(x+1,y-1) +
                -2*gp(x-1,y) + 2*gp(x+1,y) +
                -gp(x-1,y+1) + gp(x+1,y+1);
            const gy =
                -gp(x-1,y-1) - 2*gp(x,y-1) - gp(x+1,y-1) +
                 gp(x-1,y+1) + 2*gp(x,y+1) + gp(x+1,y+1);
            mag[y * w + x] = Math.sqrt(gx * gx + gy * gy);
        }
    }
    return mag;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
export const CartoonifyPanel = ({
    isOpen, onClose,
    selectedElement, selectedElementData,
    updateElement, addElement,
}) => {
    const [originalSrc, setOriginalSrc]   = useState(null);
    const [previewSrc,  setPreviewSrc]    = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMsg, setStatusMsg]       = useState('');

    // Controls
    const [colorLevels,  setColorLevels]  = useState(5);   // posterize levels 3-10
    const [edgeStr,      setEdgeStr]      = useState(55);  // 0-100 edge threshold
    const [smoothing,    setSmoothing]    = useState(1);   // 0=light, 1=med, 2=heavy bilateral

    const fileRef     = useRef(null);
    const imgRef      = useRef(null);
    const dimsRef     = useRef({ w: 400, h: 400 });
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

    useEffect(() => {
        if (!originalSrc) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(runProcess, 400);
        return () => clearTimeout(debounceRef.current);
    }, [originalSrc, colorLevels, edgeStr, smoothing]);

    const runProcess = useCallback(async () => {
        setIsProcessing(true);
        try {
            /* ── 1. Load image ── */
            if (!imgRef.current) {
                setStatusMsg('Loading…');
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = originalSrc; });
                imgRef.current = img;
            }
            const img = imgRef.current;

            /* ── 2. Scale to working resolution ── */
            // Smaller → faster bilateral. 380px is sweet spot for quality vs speed.
            const MAX = 380;
            let W = img.naturalWidth  || img.width;
            let H = img.naturalHeight || img.height;
            if (W > MAX || H > MAX) {
                const r = Math.min(MAX / W, MAX / H);
                W = Math.round(W * r); H = Math.round(H * r);
            }

            // Store final display dims (fit into 500px keeping aspect)
            const origW = img.naturalWidth  || img.width;
            const origH = img.naturalHeight || img.height;
            const fitR  = Math.min(500 / origW, 500 / origH, 1);
            dimsRef.current = { w: Math.round(origW * fitR), h: Math.round(origH * fitR) };

            /* ── 3. Draw original ── */
            const cvs = document.createElement('canvas');
            cvs.width = W; cvs.height = H;
            const ctx = cvs.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, W, H);
            const raw = ctx.getImageData(0, 0, W, H);

            /* ── 4. Bilateral filter (the key step!) ── */
            setStatusMsg('Smoothing colors…');
            await new Promise(r => setTimeout(r, 0)); // yield UI

            // Smoothing presets: light / medium / heavy
            const passes = [1, 2, 3][smoothing];
            const bRadius = smoothing === 0 ? 4 : smoothing === 1 ? 5 : 6;
            const bSigma  = smoothing === 0 ? 20 : smoothing === 1 ? 30 : 45;

            let filteredData = new Uint8ClampedArray(raw.data);
            for (let p = 0; p < passes; p++) {
                filteredData = bilateralFilter(filteredData, W, H, bRadius, bSigma);
                if (p < passes - 1) await new Promise(r => setTimeout(r, 0));
            }

            /* ── 5. Posterize → flat cartoon color fills ── */
            setStatusMsg('Flattening colors…');
            posterize(filteredData, colorLevels);

            /* ── 6. Vivid saturation boost ── */
            boostSaturation(filteredData, 1.5);

            /* ── 7. Sobel edges on original grayscale ── */
            setStatusMsg('Drawing outlines…');
            await new Promise(r => setTimeout(r, 0));

            const gray = new Float32Array(W * H);
            for (let i = 0; i < W * H; i++) {
                // Use raw (original) pixels for edge detection – not the smoothed ones
                gray[i] = 0.299 * raw.data[i * 4] + 0.587 * raw.data[i * 4 + 1] + 0.114 * raw.data[i * 4 + 2];
            }

            const mag    = sobelMag(gray, W, H);
            let   maxMag = 0;
            for (let i = 0; i < mag.length; i++) if (mag[i] > maxMag) maxMag = mag[i];

            /* ── 8. Composite: posterized colors + hard black outlines ── */
            // edgeStr 0 → very high threshold (few edges)
            // edgeStr 100 → low threshold (lots of edges)
            const thresh = maxMag * (1 - (edgeStr / 100) * 0.85);

            const out = new Uint8ClampedArray(filteredData);
            for (let i = 0; i < W * H; i++) {
                if (raw.data[i * 4 + 3] < 10) continue;
                if (mag[i] > thresh) {
                    // Pure hard black edge (binary, no soft blending = clean comic outline)
                    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 0;
                }
            }

            /* ── 9. Write output ── */
            const outCvs = document.createElement('canvas');
            outCvs.width = W; outCvs.height = H;
            outCvs.getContext('2d').putImageData(new ImageData(out, W, H), 0, 0);
            setPreviewSrc(outCvs.toDataURL('image/png', 0.92));
            setStatusMsg('');

        } catch (e) {
            console.error('CartoonifyPanel:', e);
            setStatusMsg('Error – try another image');
        } finally {
            setIsProcessing(false);
        }
    }, [originalSrc, colorLevels, edgeStr, smoothing]);

    /* Add / update canvas element */
    const handleAction = () => {
        if (!previewSrc || previewSrc === originalSrc) return;
        const { w, h } = dimsRef.current;
        if (selectedElementData?.type === 'image') {
            updateElement(selectedElement, {
                src: previewSrc, originalSrc,
                width:  selectedElementData.width  || w,
                height: selectedElementData.height || h,
            });
        } else {
            addElement('image', { src: previewSrc, width: w, height: h, originalSrc });
        }
        onClose();
    };

    if (!isOpen) return null;

    /* ── Color swatch preview (shows cartoonified palette) ── */
    const presetConfig = {
        anime:   { colorLevels: 4,  edgeStr: 70, smoothing: 2, label: '🎌 Anime' },
        comic:   { colorLevels: 5,  edgeStr: 65, smoothing: 1, label: '📚 Comic' },
        painted: { colorLevels: 8,  edgeStr: 30, smoothing: 2, label: '🎨 Painted' },
    };

    const applyPreset = (p) => {
        setColorLevels(p.colorLevels);
        setEdgeStr(p.edgeStr);
        setSmoothing(p.smoothing);
    };

    /* Pill badge helper */
    const Badge = ({ text, color = '#f97316' }) => (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: color + '18', color }}>{text}</span>
    );

    return (
        <div className="h-full flex flex-col bg-white select-none">

            {/* ── Header ── */}
            <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#fff7ed,#fefce8)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow"
                        style={{ background: 'linear-gradient(135deg,#f97316,#eab308)' }}>
                        <Wand2 size={15} color="#fff" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">Cartoonify</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Bilateral smoothing + comic outlines</p>
                    </div>
                </div>
                <button onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-orange-100 transition-colors text-gray-400 hover:text-gray-700">
                    <X size={15} />
                </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto light-scrollbar">
                <input type="file" ref={fileRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                {!originalSrc ? (
                    /* Upload zone */
                    <div onClick={() => fileRef.current?.click()}
                        className="m-4 rounded-2xl border-2 border-dashed border-orange-200 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-12">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow flex items-center justify-center">
                            <UploadIcon size={22} className="text-orange-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-800">Upload a photo</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Or select an image on canvas</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">

                        {/* ── Image preview ── */}
                        <div className="relative rounded-2xl overflow-hidden shadow-md bg-[#e8e8e8]"
                            style={{ aspectRatio: '4/3' }}>
                            <img src={previewSrc} alt="preview"
                                className="w-full h-full object-cover transition-opacity duration-300"
                                style={{ opacity: isProcessing ? 0.25 : 1 }} />

                            {isProcessing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <Loader2 size={28} className="animate-spin text-orange-500" />
                                    <p className="text-[11px] font-bold text-orange-700 tracking-widest uppercase">{statusMsg || 'Processing…'}</p>
                                </div>
                            )}

                            {!isProcessing && (
                                <div className="absolute top-2 right-2 flex gap-1.5">
                                    <button onClick={() => fileRef.current?.click()}
                                        className="px-2.5 py-1.5 bg-black/55 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white hover:bg-black/80 flex items-center gap-1">
                                        <UploadIcon size={10} /> Change
                                    </button>
                                    <button
                                        onClick={() => { setOriginalSrc(null); setPreviewSrc(null); imgRef.current = null; }}
                                        className="p-1.5 bg-black/55 backdrop-blur-sm rounded-lg text-white hover:bg-black/80">
                                        <RotateCcw size={10} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Quick presets ── */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Presets</p>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(presetConfig).map(p => (
                                    <button key={p.label} onClick={() => applyPreset(p)}
                                        className="py-2.5 text-[11px] font-bold rounded-xl border border-gray-200 bg-gray-50 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 transition-all text-gray-600">
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Controls ── */}
                        <div className={`space-y-4 transition-opacity ${isProcessing ? 'opacity-30 pointer-events-none' : ''}`}>

                            {/* Color Levels */}
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Color Zones</span>
                                    <Badge text={colorLevels <= 4 ? 'Flat Anime' : colorLevels <= 6 ? 'Comic' : 'Painted'} />
                                </div>
                                <input type="range" min="3" max="10" step="1" value={colorLevels}
                                    onChange={e => setColorLevels(+e.target.value)}
                                    className="w-full h-2 rounded-full cursor-pointer accent-orange-500" />
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>3 – Flat/Anime</span><span>10 – Illustrated</span>
                                </div>
                            </div>

                            {/* Edge Strength */}
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Outline Strength</span>
                                    <Badge text={edgeStr < 35 ? 'Subtle' : edgeStr < 65 ? 'Medium' : 'Bold'} color="#111827" />
                                </div>
                                <input type="range" min="10" max="100" step="5" value={edgeStr}
                                    onChange={e => setEdgeStr(+e.target.value)}
                                    className="w-full h-2 rounded-full cursor-pointer accent-gray-800" />
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>Soft Glow</span><span>Bold Ink</span>
                                </div>
                            </div>

                            {/* Smoothing level */}
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Area Smoothing</span>
                                    <Badge text={['Light', 'Medium', 'Heavy'][smoothing]} color="#3b82f6" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Light', 'Medium', 'Heavy'].map((lbl, idx) => (
                                        <button key={lbl} onClick={() => setSmoothing(idx)}
                                            className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                                smoothing === idx
                                                    ? 'bg-blue-500 text-white border-blue-500 shadow'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                            }`}>
                                            {lbl}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed">
                                    Heavy = slower but flatter, cleaner cartoon areas
                                </p>
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
                            : 'linear-gradient(135deg,#f97316,#eab308)',
                        color: (isProcessing || !originalSrc || previewSrc === originalSrc) ? '#9ca3af' : '#fff',
                        boxShadow: (isProcessing || !originalSrc || previewSrc === originalSrc)
                            ? 'none' : '0 4px 16px rgba(249,115,22,.35)',
                        cursor: (isProcessing || !originalSrc || previewSrc === originalSrc) ? 'not-allowed' : 'pointer',
                    }}>
                    {isProcessing
                        ? <><Loader2 size={16} className="animate-spin" />{statusMsg || 'Processing…'}</>
                        : !originalSrc ? 'Upload an Image First'
                        : previewSrc === originalSrc ? 'Waiting…'
                        : <><Check size={16} />{selectedElementData?.type === 'image' ? 'Update Image' : 'Add to Design'}</>
                    }
                </button>
            </div>
        </div>
    );
};

export default CartoonifyPanel;
