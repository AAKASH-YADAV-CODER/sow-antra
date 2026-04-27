import React, { useState, useRef, Suspense, useMemo, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { X, Tv, Wand2, Sliders, Sparkles, Image as ImageIcon } from 'lucide-react';
import { BadTVShader } from '../utils/BadTVShader';

// Shader Material Component
const BadTVMaterial = ({ texture, params }) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const { viewport } = useThree();

    useFrame((state) => {
        if (materialRef.current) {
            // Keep time constant to make the effect static as requested
            materialRef.current.uniforms.time.value = 1.0; 
            materialRef.current.uniforms.distortion.value = params.distortion;
            materialRef.current.uniforms.distortion2.value = params.distortion2;
            materialRef.current.uniforms.staticAmount.value = params.staticAmount;
            materialRef.current.uniforms.scanlineAmount.value = params.scanlineAmount;
            materialRef.current.uniforms.rgbShift.value = params.rgbShift;
        }
    });

    const uniforms = useMemo(() => {
        const u = THREE.UniformsUtils.clone(BadTVShader.uniforms);
        u.tDiffuse.value = texture;
        return u;
    }, [texture]);

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={BadTVShader.vertexShader}
                fragmentShader={BadTVShader.fragmentShader}
            />
        </mesh>
    );
};

// Snapshot Handler
const SnapshotHandler = ({ onCaptureReady }) => {
    const { gl, scene, camera } = useThree();
    
    React.useImperativeHandle(onCaptureReady, () => ({
        capture: () => {
            gl.render(scene, camera);
            return gl.domElement.toDataURL('image/png');
        }
    }));

    return null;
};

const CustomSlider = ({ label, value, min, max, onChange, step = 0.01 }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
            <span className="text-[10px] font-mono text-[#8b3dff]">{Number(value).toFixed(2)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b3dff]"
        />
    </div>
);

const BadTVPanel = ({ isOpen, onClose, addElement }) => {
    const [image, setImage] = useState(null);
    const [texture, setTexture] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const captureRef = useRef();
    const fileInputRef = useRef();

    const [params, setParams] = useState({
        distortion: 1.5,
        distortion2: 1.0,
        staticAmount: 0.15,
        scanlineAmount: 0.5,
        rgbShift: 0.01
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const tex = new THREE.Texture(img);
                    tex.needsUpdate = true;
                    setTexture(tex);
                    setImage(event.target.result);
                    setIsLoading(false);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApply = () => {
        if (captureRef.current) {
            const dataUrl = captureRef.current.capture();
            addElement('image', { 
                src: dataUrl,
                name: 'Bad TV Effect',
                fitToCanvas: false 
            });
        }
    };

    const handleClear = () => {
        setImage(null);
        setTexture(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-6 light-scrollbar">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#8b3dff] to-[#ff4b2b] p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <Tv size={20} />
                            Bad TV App
                        </h3>
                        <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                            Apply retro television artifacts, noise, and glitches to your photos.
                        </p>
                    </div>
                    <Sparkles size={80} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
                </div>

                {/* Main Content */}
                {!image ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-[#8b3dff] hover:bg-purple-50 transition-all cursor-pointer group"
                    >
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-[#8b3dff] group-hover:scale-110 transition-transform shadow-inner">
                            <ImageIcon size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-700">Choose an image</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-medium">PNG, JPG or SVG</p>
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="hidden" 
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 px-1">
                            <span className="uppercase tracking-widest">Live Preview</span>
                            <button onClick={handleClear} className="text-red-500 hover:text-red-600 flex items-center gap-1 font-bold">
                                <X size={12} /> REMOVE
                            </button>
                        </div>

                        {/* Preview Canvas */}
                        <div className="aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-gray-50">
                            {/* dpr={4} dramatically increases rendering and snapshot quality */}
                            <Canvas dpr={4} gl={{ preserveDrawingBuffer: true }}>
                                <Suspense fallback={null}>
                                    <BadTVMaterial texture={texture} params={params} />
                                    <SnapshotHandler onCaptureReady={captureRef} />
                                </Suspense>
                            </Canvas>
                        </div>

                        {/* Controls */}
                        <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Sliders size={14} className="text-[#8b3dff]" />
                                <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Adjustments</h4>
                            </div>
                            
                            <CustomSlider 
                                label="Wavy Distortion" 
                                value={params.distortion} 
                                min={0} max={10} 
                                onChange={(val) => setParams(p => ({ ...p, distortion: val }))} 
                            />
                            <CustomSlider 
                                label="Fine Jitter" 
                                value={params.distortion2} 
                                min={0} max={5} 
                                onChange={(val) => setParams(p => ({ ...p, distortion2: val }))} 
                            />
                            <CustomSlider 
                                label="Static Noise" 
                                value={params.staticAmount} 
                                min={0} max={1} 
                                onChange={(val) => setParams(p => ({ ...p, staticAmount: val }))} 
                            />
                            <CustomSlider 
                                label="Scanline Intensity" 
                                value={params.scanlineAmount} 
                                min={0} max={1} 
                                onChange={(val) => setParams(p => ({ ...p, scanlineAmount: val }))} 
                            />
                            <CustomSlider 
                                label="RGB Split" 
                                value={params.rgbShift} 
                                min={0} max={0.05} 
                                onChange={(val) => setParams(p => ({ ...p, rgbShift: val }))} 
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                    disabled={!image || isLoading}
                    onClick={handleApply}
                    className="w-full py-4 bg-[#8b3dff] hover:bg-[#7a2fd6] disabled:bg-gray-200 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-3"
                >
                    <Wand2 size={18} />
                    Add to design
                </button>
            </div>
        </div>
    );
};

export default memo(BadTVPanel);
