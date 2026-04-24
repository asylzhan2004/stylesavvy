import { useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function TShirtModel({ position, color, speed, rotationSpeed }: any) {
    const meshRef = useRef<THREE.Group>(null!);
    const [hovered, setHovered] = useState(false);

    // Load the GLB model
    const { scene } = useGLTF('/models/Kyim8blend.glb');

    // Clone and prepare the object
    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // 1. Calculate Bounding Box
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // 2. Center the model
        clone.position.sub(center);

        // 3. Auto-Scale
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 2.5;
        const scaleFactor = targetSize / maxDimension;
        clone.scale.setScalar(scaleFactor);

        // Apply material
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshPhysicalMaterial({
                    color: color,
                    roughness: 0.2,
                    metalness: 0.1,
                    transmission: 0.1,
                    thickness: 1,
                    clearcoat: 0.5,
                    side: THREE.DoubleSide
                });
            }
        });
        return clone;
    }, [scene, color]);

    // Find bones for animation (adjust names if they differ in your Blender file)
    const bones = useMemo(() => {
        const foundBones: THREE.Bone[] = [];
        clonedScene.traverse((child) => {
            if ((child as THREE.Bone).isBone && child.name.toLowerCase().includes('sleeve')) {
                foundBones.push(child as THREE.Bone);
            }
        });
        return foundBones;
    }, [clonedScene]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const { x, y } = state.mouse;

        // Previous rotation for inertia calculation
        const prevRotX = meshRef.current.rotation.x;
        const prevRotY = meshRef.current.rotation.y;

        // Smooth rotation
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, y * rotationSpeed + 0.2, 0.1);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * rotationSpeed + state.clock.elapsedTime * 0.2, 0.1);

        // Movement
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0] + x * 2, 0.05);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + y * 2, 0.05);

        // Sleeve Physics (Inertia)
        const rotationDiffX = meshRef.current.rotation.x - prevRotX;
        const rotationDiffY = meshRef.current.rotation.y - prevRotY;

        bones.forEach((bone) => {
            // Reaction to horizontal rotation (Y-axis rotation causes Z-axis bone bend)
            bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, rotationDiffY * 5, 0.1);
            // Reaction to vertical rotation
            bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, rotationDiffX * 5, 0.1);
        });
    });

    return (
        <Float speed={speed} rotationIntensity={1} floatIntensity={1}>
            <group
                ref={meshRef}
                position={position}
                scale={hovered ? 1.1 : 1}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <primitive object={clonedScene} />
            </group>
        </Float>
    );
}

export function InteractiveShapes() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.3} />
                    <pointLight position={[10, 10, 10]} intensity={1.2} color="#39ff14" />
                    <pointLight position={[-10, -10, -10]} intensity={0.6} color="#39ff14" />
                    <pointLight position={[0, 5, 5]} intensity={0.4} color="#00fff5" />

                    <InteractiveShapesGroup />
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    );
}

function InteractiveShapesGroup() {
    return (
        <group>
            {/* T-Shirt - Left */}
            <TShirtModel
                position={[-4, 0, 0]}
                color="#39ff14" // Neon Green
                speed={2}
                rotationSpeed={0.5}
                scale={0.02} // Adjust scale as OBJ might be huge
            />

            {/* T-Shirt - Right */}
            <TShirtModel
                position={[4, -1, -2]}
                color="#15803d" // Dark Neon Green
                speed={3}
                rotationSpeed={0.8}
                scale={0.02}
            />

            {/* T-Shirt - Top Center (Further away) */}
            <TShirtModel
                position={[0, 3, -5]}
                color="#22c55e" // Emerald
                speed={1.5}
                rotationSpeed={0.3}
                scale={0.02}
            />
        </group>
    );
}
