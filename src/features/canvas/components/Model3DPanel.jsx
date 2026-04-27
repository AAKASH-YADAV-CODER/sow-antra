import React, { useState, useRef, Suspense, memo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Center, Environment } from '@react-three/drei';
import { Upload, X, Box, RotateCw, ZoomIn, Maximize2 } from 'lucide-react';
import { useModelLoader } from '../hooks/useModelLoader';

// Internal component to handle capturing the scene
const SnapshotHandler = ({ onCaptureReady }) => {
    const { gl, scene, camera } = useThree();
    
    // We expose a function to the parent via a callback or ref-like pattern
    // In this case, we'll just use the gl element directly in the parent if needed,
    // but R3F works better if we do it here.
    React.useImperativeHandle(onCaptureReady, () => ({
        capture: () => {
            gl.render(scene, camera);
            return gl.domElement.toDataURL('image/png');
        }
    }));

    return null;
};

const ModelPreview = ({ model }) => {
    if (!model) return null;

    return (
        <Center top>
            <primitive object={model} />
        </Center>
    );
};

const Model3DPanel = ({ isOpen, onClose, addElement }) => {
    const { loadModel, isLoading, error } = useModelLoader();
    const [currentModel, setCurrentModel] = useState(null);
    const [fileName, setFileName] = useState('');
    const captureRef = useRef();
    const fileInputRef = useRef();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            try {
                const model = await loadModel(file);
                setCurrentModel(model);
            } catch (err) {
                console.error("3D Load Error:", err);
            }
        }
    };

    const handleApply = () => {
        if (captureRef.current) {
            const dataUrl = captureRef.current.capture();
            addElement('image', { 
                src: dataUrl,
                name: `3D Model (${fileName})`,
                fitToCanvas: false 
            });
            // Optimization: Keep the panel open or close it? usually Canva keeps it open if it's an "app"
            // but the user might want it closed. 
            // In Sowntra, many apps stay open.
        }
    };

    const handleClear = () => {
        setCurrentModel(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-6 light-scrollbar">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#8b3dff] to-[#bd83f8] p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <Box size={20} />
                            3D Model Viewer
                        </h3>
                        <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                            Upload your CAD models (STL, OBJ, GLB) and add them to your design with transparent backgrounds.
                        </p>
                    </div>
                    <Box size={80} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
                </div>

                {/* Upload Area */}
                {!currentModel ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[#8b3dff] hover:bg-purple-50 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-[#8b3dff] group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-700">Click to upload 3D model</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Supports STL, OBJ, GLB, GLTF</p>
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".stl,.obj,.glb,.gltf" 
                            onChange={handleFileChange}
                            className="hidden" 
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
                            <span>Live Preview</span>
                            <button onClick={handleClear} className="text-red-500 hover:text-red-600 flex items-center gap-1">
                                <X size={12} /> Remove
                            </button>
                        </div>
                        
                        {/* 3D Preview Container */}
                        <div className="h-64 bg-gray-50 rounded-2xl border border-gray-100 relative group overflow-hidden shadow-inner">
                            <Canvas 
                                shadows 
                                camera={{ position: [0, 0, 10], fov: 50 }}
                                gl={{ preserveDrawingBuffer: true, alpha: true }}
                                dpr={[1, 2]}
                            >
                                <Suspense fallback={null}>
                                    <Stage environment="city" intensity={0.6} contactShadow={false}>
                                        <ModelPreview model={currentModel} />
                                    </Stage>
                                    <Environment preset="city" />
                                    <SnapshotHandler onCaptureReady={captureRef} />
                                </Suspense>
                                <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
                            </Canvas>
                            
                            <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm text-gray-500 hover:text-[#8b3dff] cursor-help" title="Click and drag to rotate">
                                    <RotateCw size={14} />
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm text-gray-500 hover:text-[#8b3dff] cursor-help" title="Scroll to zoom">
                                    <ZoomIn size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                            <div className="mt-0.5 text-blue-500"><Box size={14} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-700 truncate max-w-[200px]">{fileName}</p>
                                <p className="text-[9px] text-blue-500 leading-tight mt-0.5">Adjust the orientation above. It will be added exactly as shown.</p>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-10 h-10 border-4 border-purple-100 border-t-[#8b3dff] rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parsing model...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                        <p className="text-xs font-bold text-red-600 uppercase mb-1">Upload Failed</p>
                        <p className="text-[10px] text-red-500 leading-relaxed">{error}</p>
                        <button 
                            onClick={handleClear}
                            className="mt-3 px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg"
                        >
                            TRY AGAIN
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                    disabled={!currentModel || isLoading}
                    onClick={handleApply}
                    className="w-full py-4 bg-[#8b3dff] hover:bg-[#7a2fd6] disabled:bg-gray-200 disabled:shadow-none text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-3"
                >
                    <Maximize2 size={18} />
                    Add to design
                </button>
            </div>
        </div>
    );
};

export default memo(Model3DPanel);
