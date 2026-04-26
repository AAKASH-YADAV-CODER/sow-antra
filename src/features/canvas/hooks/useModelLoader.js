import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * useModelLoader Hook
 * Handles loading and parsing various 3D file formats.
 */
export const useModelLoader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadModel = useCallback(async (file) => {
        if (!file) return null;

        setIsLoading(true);
        setError(null);

        const extension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                const data = event.target.result;
                
                try {
                    let model = null;

                    if (extension === 'stl') {
                        const loader = new STLLoader();
                        const geometry = loader.parse(data);
                        const material = new THREE.MeshStandardMaterial({ color: 0x8b3dff });
                        model = new THREE.Mesh(geometry, material);
                    } 
                    else if (extension === 'obj') {
                        const loader = new OBJLoader();
                        // OBJLoader expects a string for parse() if it's text-based
                        const text = new TextDecoder().decode(data);
                        model = loader.parse(text);
                    } 
                    else if (extension === 'glb' || extension === 'gltf') {
                        const loader = new GLTFLoader();
                        const gltf = await new Promise((res, rej) => {
                            loader.parse(data, '', res, rej);
                        });
                        model = gltf.scene;
                    } 
                    else {
                        throw new Error(`Unsupported file format: .${extension}`);
                    }

                    // Center and scale the model automatically
                    if (model) {
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());
                        
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const scale = 5 / maxDim; // Normalize to a reasonable size for the preview
                        
                        model.position.x -= center.x;
                        model.position.y -= center.y;
                        model.position.z -= center.z;
                        model.scale.set(scale, scale, scale);
                    }

                    setIsLoading(false);
                    resolve(model);
                } catch (err) {
                    setIsLoading(false);
                    setError(err.message);
                    reject(err);
                }
            };

            reader.onerror = () => {
                setIsLoading(false);
                setError("Failed to read file");
                reject(new Error("Failed to read file"));
            };

            // Read as ArrayBuffer for binary formats (STL binary, GLB)
            reader.readAsArrayBuffer(file);
        });
    }, []);

    return { loadModel, isLoading, error };
};
