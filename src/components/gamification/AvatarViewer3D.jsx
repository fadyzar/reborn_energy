
// This component is currently causing issues due to library import problems.
// Since we are reverting to 2D images, we can leave this file as is for now.
// It will not be called if the avatar does not have a `model_url`.
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// We are removing the deep imports that were failing.
// We will try to access these modules directly from the main THREE object.
import { Loader2 } from 'lucide-react';

function Loader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm z-20">
      <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
      <p className="text-lg text-white">טוען מודל תלת-ממדי...</p>
    </div>
  );
}

export default function AvatarViewer3D({ modelUrl }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!modelUrl || !mountRef.current) return;

    // Defensive check: Ensure the required addons are available on the THREE object.
    if (!THREE.GLTFLoader || !THREE.OrbitControls || !THREE.RoomEnvironment) {
      setError("סביבת התלת-ממד אינה נתמכת באופן מלא. חסרים כלים חיוניים לטעינת המודל.");
      setLoading(false);
      console.error("Three.js addons (GLTFLoader, OrbitControls, RoomEnvironment) are not available on the THREE object.");
      return;
    }

    const currentMount = mountRef.current;
    let animationFrameId;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    currentMount.appendChild(renderer.domElement);

    // --- Environment for lighting ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.background = null; // Transparent background

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 5);

    // --- Controls ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 8;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.9;
    controls.target.set(0, -0.5, 0);
    controls.update();

    // --- GLTF Loader ---
    const loader = new THREE.GLTFLoader();
    setLoading(true);
    setError(null);
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        model.position.set(0, -1.5, 0);
        scene.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('An error happened during model loading:', err);
        setError('שגיאה בטעינת המודל. ייתכן שהקישור אינו תקין.');
        setLoading(false);
      }
    );

    // --- Animation loop ---
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle resize ---
    const handleResize = () => {
        if (currentMount) {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        }
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
      });
      renderer.dispose();
      envTexture.dispose();
      pmremGenerator.dispose();
    };
  }, [modelUrl]);

  if (!modelUrl) {
    return <div className="text-white text-center p-8">לא סופק קישור למודל תלת-ממד.</div>;
  }

  return (
    <div className="w-full h-full relative" ref={mountRef}>
      {loading && <Loader />}
      {error && <div className="absolute inset-0 flex items-center justify-center text-center text-red-400 bg-gray-900/70 p-4">{error}</div>}
    </div>
  );
}
