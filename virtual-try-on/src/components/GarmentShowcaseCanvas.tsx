import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GarmentShowcaseCanvasProps {
    modelPath: string;
    accent?: string;
    modelScale?: number;
    modelRotation?: [number, number, number];
    modelPosition?: [number, number, number];
}

function cloneMaterial(material: THREE.Material) {
    const next = material.clone();

    if ('side' in next) {
        (next as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    }

    return next;
}

function FloatingGarment({
    modelPath,
    modelScale = 1,
    modelRotation = [0, 0, 0],
    modelPosition = [0, 0, 0],
}: GarmentShowcaseCanvasProps) {
    const ref = useRef<THREE.Group>(null);
    const { scene } = useGLTF(modelPath);

    const prepared = useMemo(() => {
        const clone = scene.clone(true);
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);
        clone.position.sub(center);

        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        clone.scale.setScalar((2.35 / maxDimension) * modelScale);

        clone.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) {
                return;
            }

            child.material = Array.isArray(child.material)
                ? child.material.map(cloneMaterial)
                : cloneMaterial(child.material);
        });

        return clone;
    }, [modelScale, scene]);

    useFrame(({ clock }) => {
        if (!ref.current) {
            return;
        }

        const t = clock.getElapsedTime();
        ref.current.position.y = modelPosition[1] + Math.sin(t * 1.15) * 0.16;
        ref.current.position.x = modelPosition[0];
        ref.current.position.z = modelPosition[2];
        ref.current.rotation.y = modelRotation[1] + t * 0.28;
        ref.current.rotation.x = modelRotation[0] + Math.sin(t * 0.65) * 0.08;
        ref.current.rotation.z = modelRotation[2] + Math.cos(t * 0.5) * 0.03;
    });

    return (
        <group ref={ref}>
            <primitive object={prepared} />
        </group>
    );
}

export function GarmentShowcaseCanvas({
    modelPath,
    accent = '#39ff14',
    modelScale = 1,
    modelRotation = [0, 0, 0],
    modelPosition = [0, 0, 0],
}: GarmentShowcaseCanvasProps) {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas
                camera={{ position: [0, 0, 4.6], fov: 32 }}
                dpr={[1, 1]}          // Фиксируем 1x — убираем лишний суперсэмплинг
                gl={{ antialias: false, powerPreference: 'high-performance' }}
                performance={{ min: 0.5 }} // Авто-снижение DPR под нагрузкой
            >
                <ambientLight intensity={1.1} />
                <hemisphereLight intensity={0.9} groundColor="#08110a" color="#f3fff1" />
                <directionalLight position={[3.5, 4.5, 3]} intensity={2} />
                <directionalLight position={[-2, 1.5, 2]} intensity={0.85} color={accent} />
                <pointLight position={[0, -2, 2]} intensity={0.55} color={accent} />

                <Suspense
                    fallback={
                        <Html center>
                            <div style={{ color: '#9cb29f', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                                Loading 3D
                            </div>
                        </Html>
                    }
                >
                    <FloatingGarment
                        modelPath={modelPath}
                        modelScale={modelScale}
                        modelRotation={modelRotation}
                        modelPosition={modelPosition}
                    />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minPolarAngle={Math.PI * 0.32}
                    maxPolarAngle={Math.PI * 0.68}
                />
            </Canvas>
        </div>
    );
}

// Preload только тех моделей, что реально используются на главной
[
    '/models/men/tops/Kyim8blend.glb',        // tops card
    '/models/men/bottoms/jeansblend2.glb',    // bottoms card
    '/models/men/outerwear/Jacket2.glb',      // jackets card
    '/models/women/dresses/dressgirl.glb',    // dresses card
    '/models/men/tops/Bezrukavka.glb',       // baselayer card
].forEach((path) => useGLTF.preload(path));
