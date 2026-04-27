import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, Check, Sparkles, History } from 'lucide-react';

const PREMIUM_PALETTES = [
  { name: 'Metaverse', colors: ['#8b3dff', '#00f2fe', '#4facfe', '#764ba2'] },
  { name: 'Sunset', colors: ['#ff9a9e', '#fecfef', '#f6d365', '#fda085'] },
  { name: 'Nature', colors: ['#43e97b', '#38f8d0', '#0097a7', '#00c2cb'] },
];

const ColorWheel = ({ color, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('wheel'); // 'wheel', 'mixer'
  const [h, setH] = useState(0);
  const [s, setS] = useState(100);
  const [v, setV] = useState(100);
  const [copied, setCopied] = useState(false);
  const [recentColors, setRecentColors] = useState([]);
  
  // Mixer State
  const [mixColor1, setMixColor1] = useState('#8B5CF6');
  const [mixColor2, setMixColor2] = useState('#10B981');
  const [mixRatio, setMixRatio] = useState(50);

  const hueRef = useRef(null);
  const svRef = useRef(null);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingSV, setIsDraggingSV] = useState(false);

  // Load recent colors from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('whiteboard_recent_colors') || '[]');
    setRecentColors(saved);
  }, []);

  const saveToRecent = useCallback((hex) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== hex);
      const updated = [hex, ...filtered].slice(0, 8);
      localStorage.setItem('whiteboard_recent_colors', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (!hex) return { r: 0, g: 0, b: 0 };
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
  };

  const rgbToHex = (r, g, b) => {
    const toHex = x => {
      const val = Math.max(0, Math.min(255, Math.round(x)));
      const hex = val.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getMixedColor = useCallback(() => {
    const rgb1 = hexToRgb(mixColor1);
    const rgb2 = hexToRgb(mixColor2);
    const ratio = mixRatio / 100;
    const r = rgb1.r * (1 - ratio) + rgb2.r * ratio;
    const g = rgb1.g * (1 - ratio) + rgb2.g * ratio;
    const b = rgb1.b * (1 - ratio) + rgb2.b * ratio;
    return rgbToHex(r, g, b);
  }, [mixColor1, mixColor2, mixRatio]);

  // Initial color parsing (Hex to HSV)
  useEffect(() => {
    const hexToHsv = (hex) => {
      let { r, g, b } = hexToRgb(hex);
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, v = max;
      const d = max - min;
      s = max === 0 ? 0 : d / max;
      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }
      return { h: h * 360, s: s * 100, v: v * 100 };
    };

    if (color && color.startsWith('#')) {
      const hsv = hexToHsv(color);
      setH(hsv.h);
      setS(hsv.s);
      setV(hsv.v);
    }
  }, [color]);

  const hsvToHex = (h, s, v) => {
    s /= 100; v /= 100;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
      default: r = 0; g = 0; b = 0;
    }
    return rgbToHex(r * 255, g * 255, b * 255);
  };

  const copyToClipboard = () => {
    const hex = hsvToHex(h, s, v).toUpperCase();
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHueMove = useCallback((e) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left - centerX;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top - centerY;
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    setH(angle);
    onChange(hsvToHex(angle, s, v));
  }, [s, v, onChange]);

  const handleSVMove = useCallback((e) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) / rect.height));
    const newS = x * 100;
    const newV = (1 - y) * 100;
    setS(newS);
    setV(newV);
    onChange(hsvToHex(h, newS, newV));
  }, [h, onChange]);

  useEffect(() => {
    const handleUp = () => {
      if (isDraggingHue || isDraggingSV) {
        saveToRecent(hsvToHex(h, s, v));
      }
      setIsDraggingHue(false);
      setIsDraggingSV(false);
    };
    const handleMove = (e) => {
      if (isDraggingHue) handleHueMove(e);
      if (isDraggingSV) handleSVMove(e);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDraggingHue, isDraggingSV, handleHueMove, handleSVMove, h, s, v, saveToRecent]);

  return (
    <div className="absolute top-12 left-0 mt-4 bg-white/98 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-white/50 p-7 flex flex-col gap-6 z-[60] animate-in zoom-in-95 duration-300 origin-top-left min-w-[550px]">
      {/* Tab Switcher */}
      <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-start">
        <button 
          onClick={() => setActiveTab('wheel')}
          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'wheel' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Wheel
        </button>
        <button 
          onClick={() => setActiveTab('mixer')}
          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mixer' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Mixer
        </button>
      </div>

      <div className="flex gap-8">
        {/* Left Column: Content */}
        {activeTab === 'wheel' ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em]">Studio Wheel</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl shadow-xl border-2 border-white transition-all duration-500" style={{ backgroundColor: hsvToHex(h, s, v), transform: `rotate(${h}deg)` }} />
            </div>

            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* Hue Ring */}
              <div 
                ref={hueRef}
                className="absolute inset-0 rounded-full cursor-crosshair"
                style={{ 
                  background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                  padding: '12px',
                  backgroundClip: 'content-box',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.08), 0 0 30px rgba(0,0,0,0.05)'
                }}
                onMouseDown={(e) => { setIsDraggingHue(true); handleHueMove(e); }}
                onTouchStart={(e) => { setIsDraggingHue(true); handleHueMove(e); }}
              >
                {/* Hue Selector Dot */}
                <div 
                  className="absolute w-5 h-5 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.2)] border-[3px] border-white pointer-events-none"
                  style={{ 
                    left: `calc(50% + ${Math.cos(h * Math.PI / 180) * 100}px - 10px)`,
                    top: `calc(50% + ${Math.sin(h * Math.PI / 180) * 100}px - 10px)`,
                  }}
                />
              </div>

              {/* Saturation/Value Square */}
              <div 
                ref={svRef}
                className="relative w-28 h-28 rounded-2xl overflow-hidden cursor-crosshair shadow-inner"
                style={{ 
                  backgroundColor: `hsl(${h}, 100%, 50%)`,
                }}
                onMouseDown={(e) => { setIsDraggingSV(true); handleSVMove(e); }}
                onTouchStart={(e) => { setIsDraggingSV(true); handleSVMove(e); }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #fff, transparent)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #000, transparent)' }} />
                
                {/* SV Selector Dot */}
                <div 
                  className="absolute w-4 h-4 rounded-full border-[3px] border-white shadow-lg pointer-events-none -translate-x-1/2 translate-y-1/2"
                  style={{ 
                    left: `${s}%`,
                    bottom: `${v}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-100 shadow-sm">
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Hex</span>
               <input 
                 type="text" 
                 value={hsvToHex(h, s, v).toUpperCase()}
                 readOnly
                 className="bg-transparent border-none text-xs font-black text-gray-700 w-full focus:ring-0 text-right uppercase"
               />
               <button 
                 onClick={copyToClipboard}
                 className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-purple-600 transition-all shadow-sm active:scale-90"
               >
                 {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
               </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 w-56">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-purple-500" />
              <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em]">Color Mixer</h3>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1 relative">
                <div 
                  className="w-full aspect-square rounded-2xl shadow-lg border-2 border-white cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: mixColor1 }}
                />
                <input 
                  type="color" 
                  value={mixColor1} 
                  onChange={(e) => setMixColor1(e.target.value)}
                  className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
                />
                <span className="text-[9px] font-bold text-gray-400 text-center uppercase">Color A</span>
              </div>
              <div className="text-gray-300 font-black">+</div>
              <div className="flex flex-col gap-2 flex-1 relative">
                <div 
                  className="w-full aspect-square rounded-2xl shadow-lg border-2 border-white cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: mixColor2 }}
                />
                <input 
                  type="color" 
                  value={mixColor2} 
                  onChange={(e) => setMixColor2(e.target.value)}
                  className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
                />
                <span className="text-[9px] font-bold text-gray-400 text-center uppercase">Color B</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                <span>Ratio</span>
                <span>{mixRatio}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={mixRatio} 
                onChange={(e) => setMixRatio(e.target.value)}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div 
                className="w-full h-16 rounded-2xl shadow-xl border-4 border-white transition-all duration-300"
                style={{ backgroundColor: getMixedColor() }}
              />
              <button 
                onClick={() => {
                  const mixed = getMixedColor();
                  onChange(mixed);
                  saveToRecent(mixed);
                }}
                className="w-full py-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
              >
                Apply Blend
              </button>
            </div>
          </div>
        )}

        {/* Right Column: Palettes & Recent */}
        <div className="flex flex-col gap-6 w-52 border-l border-gray-100 pl-8">
          {/* Recent Colors */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-400">
              <History size={12} />
              <h4 className="text-[9px] font-black uppercase tracking-widest">Recently Used</h4>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {recentColors.map((rc, i) => (
                <button 
                  key={rc + i}
                  onClick={() => onChange(rc)}
                  className="w-full aspect-square rounded-lg border border-gray-100 hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: rc }}
                />
              ))}
            </div>
          </div>

          {/* Premium Palettes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles size={12} className="text-amber-400" />
              <h4 className="text-[9px] font-black uppercase tracking-widest">Premium Palettes</h4>
            </div>
            {PREMIUM_PALETTES.map(p => (
              <div key={p.name} className="space-y-1.5">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter px-0.5">{p.name}</span>
                <div className="flex gap-1.5">
                  {p.colors.map(c => (
                    <button 
                      key={c}
                      onClick={() => onChange(c)}
                      className="flex-1 h-6 rounded-md hover:scale-105 transition-transform shadow-sm border border-white/50"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="mt-auto w-full py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg"
          >
            Save Style
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorWheel;
