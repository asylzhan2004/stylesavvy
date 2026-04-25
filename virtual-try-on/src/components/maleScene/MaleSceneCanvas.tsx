/**
 * MaleSceneCanvas
 *
 * Renders:
 *   • Avatar base model (SkinnedMesh from GLB, FK-poseable)
 *   • Garment (static mesh, positioned via TransformControls)
 *   • Generated clothing pieces (SkinnedMesh built from body-surface extraction,
 *     perfectly follow avatar deformation — same skeleton + same bone weights)
 *   • ARP-style bone overlay with FK-chain highlighting
 */

import {
    Suspense, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, TransformControls, useGLTF } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import type { BonePose, MaleGarmentPreset } from '../../features/maleScene/config';
import { EDITABLE_MALE_BONES, MALE_BASE_MODEL_URL } from '../../features/maleScene/config';


// ── Types ─────────────────────────────────────────────────────────────────────
type EditTarget = 'garment' | 'bone';
type TransformMode = 'translate' | 'rotate' | 'scale';



export interface MaleSceneCanvasProps {
    garmentUrl: string;
    preset: MaleGarmentPreset;
    selectedBoneName?: string | null;
    editTarget?: EditTarget;
    transformMode?: TransformMode;
    showSkeleton?: boolean;
    editable?: boolean;
    onGarmentTransformChange?: (t: MaleGarmentPreset['garmentTransform']) => void;
    onBoneTransformChange?: (boneName: string, pose: BonePose) => void;
    onBonesReady?: (boneNames: string[]) => void;
    onBoneDefaultsReady?: (bones: Record<string, BonePose>) => void;
    onBoneSelect?: (boneName: string) => void;
}

// ── FK hierarchy ──────────────────────────────────────────────────────────────
const BONE_PARENT_MAP: Record<string, string> = {
    Spine: 'Hips', Spine1: 'Spine', Spine2: 'Spine1',
    Neck: 'Spine2', Head: 'Neck',
    LeftShoulder: 'Spine2', LeftArm: 'LeftShoulder',
    LeftForeArm: 'LeftArm', LeftHand: 'LeftForeArm',
    RightShoulder: 'Spine2', RightArm: 'RightShoulder',
    RightForeArm: 'RightArm', RightHand: 'RightForeArm',
    LeftUpLeg: 'Hips', LeftLeg: 'LeftUpLeg',
    LeftFoot: 'LeftLeg', LeftToeBase: 'LeftFoot',
    RightUpLeg: 'Hips', RightLeg: 'RightUpLeg',
    RightFoot: 'RightLeg', RightToeBase: 'RightFoot',
};

function buildChildrenMap() {
    const m: Record<string, string[]> = {};
    for (const [c, p] of Object.entries(BONE_PARENT_MAP)) (m[p] ??= []).push(c);
    return m;
}
const BONE_CHILDREN = buildChildrenMap();

function descendants(name: string) {
    const s = new Set<string>();
    const q = [name];
    while (q.length) {
        const cur = q.pop()!;
        for (const k of BONE_CHILDREN[cur] ?? []) { s.add(k); q.push(k); }
    }
    return s;
}

// ── ARP colours ───────────────────────────────────────────────────────────────
const BONE_COLOR: Record<string, string> = {
    Hips: '#00e5cc', Spine: '#00e5cc', Spine1: '#00e5cc', Spine2: '#00e5cc',
    Neck: '#00e5cc', Head: '#00e5cc',
    LeftShoulder: '#ffb347', LeftArm: '#ffb347', LeftForeArm: '#ffb347', LeftHand: '#ffb347',
    LeftUpLeg: '#ffb347', LeftLeg: '#ffb347', LeftFoot: '#ffb347', LeftToeBase: '#ffb347',
    RightShoulder: '#7eb8ff', RightArm: '#7eb8ff', RightForeArm: '#7eb8ff', RightHand: '#7eb8ff',
    RightUpLeg: '#7eb8ff', RightLeg: '#7eb8ff', RightFoot: '#7eb8ff', RightToeBase: '#7eb8ff',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const cloneMat = (m: THREE.Material) => {
    const c = m.clone();
    if ('side' in c) (c as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    return c;
};
const readTransform = (object: THREE.Object3D) => ({
    position: [object.position.x, object.position.y, object.position.z] as BonePose['position'],
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z] as BonePose['rotation'],
});
const readGarmentTransform = (object: THREE.Object3D): MaleGarmentPreset['garmentTransform'] => ({
    ...readTransform(object),
    scale: [object.scale.x, object.scale.y, object.scale.z],
});
const prepareStatic = (src: THREE.Object3D) => {
    const cl = src.clone(true);
    cl.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = Array.isArray(child.material)
            ? child.material.map(cloneMat) : cloneMat(child.material);
    });
    return cl;
};

const _jointWp = new THREE.Vector3();

// ── Joint sphere ──────────────────────────────────────────────────────────────
function JointSphere({ bone, boneName, isSelected, isChain, isEditable, onSelect }: {
    bone: THREE.Bone; boneName: string; isSelected: boolean;
    isChain: boolean; isEditable: boolean; onSelect: (n: string) => void;
}) {
    const ref = useRef<THREE.Mesh>(null!);
    const [hov, setHov] = useState(false);
    const t = useRef(0);
    const base = BONE_COLOR[boneName] ?? '#7dff8f';

    useFrame((_, dt) => {
        if (!ref.current) return;
        t.current += dt;
        bone.getWorldPosition(_jointWp);
        ref.current.position.copy(_jointWp);
        ref.current.scale.setScalar(
            isSelected ? 1 + Math.sin(t.current * 5) * 0.22
                : isChain ? 1 + Math.sin(t.current * 3) * 0.12
                    : hov ? 1.4 : 1,
        );
    });

    if (!isEditable) return null;
    const r = isSelected ? 0.031 : isChain ? 0.026 : hov ? 0.025 : 0.021;

    return (
        <mesh ref={ref} renderOrder={999}
            onPointerEnter={e => { e.stopPropagation(); setHov(true); }}
            onPointerLeave={() => setHov(false)}
            onClick={e => { e.stopPropagation(); onSelect(boneName); }}
        >
            <icosahedronGeometry args={[r, 1]} />
            <meshStandardMaterial
                color={isSelected ? '#fff' : base}
                emissive={isSelected || isChain || hov ? base : '#000'}
                emissiveIntensity={isSelected ? 1.8 : isChain ? 0.9 : hov ? 0.7 : 0}
                opacity={isSelected ? 1 : isChain ? 0.9 : hov ? 0.9 : 0.72}
                transparent depthTest={false} roughness={0.15} metalness={0.7}
            />
        </mesh>
    );
}

function BoneStick({ parentBone, childBone, boneName, isSelected, isChain }: {
    parentBone: THREE.Bone; childBone: THREE.Bone;
    boneName: string; isSelected: boolean; isChain: boolean;
}) {
    const line = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
        const obj = new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, depthTest: false }));
        obj.renderOrder = 998;
        return obj;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const _pw = useMemo(() => new THREE.Vector3(), []);
    const _cw = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        const attr = line.geometry.attributes.position as THREE.BufferAttribute;
        parentBone.getWorldPosition(_pw); childBone.getWorldPosition(_cw);
        attr.setXYZ(0, _pw.x, _pw.y, _pw.z); attr.setXYZ(1, _cw.x, _cw.y, _cw.z);
        attr.needsUpdate = true;
        const mat = line.material as THREE.LineBasicMaterial;
        mat.color.set(isSelected ? '#fff' : BONE_COLOR[boneName] ?? '#7dff8f');
        mat.opacity = isSelected ? 1 : isChain ? 0.72 : 0.36;
    });

    return <primitive object={line} />;
}

function SkeletonOverlay({ bones, selectedBoneName, editable, onBoneSelect }: {
    bones: Record<string, THREE.Bone>; selectedBoneName: string | null;
    editable: boolean; onBoneSelect: (n: string) => void;
}) {
    const names = Object.keys(bones).filter(n => EDITABLE_MALE_BONES.includes(n));
    const chain = useMemo(() => selectedBoneName ? descendants(selectedBoneName) : new Set<string>(), [selectedBoneName]);

    return (
        <>
            {names.map(n => {
                const pn = BONE_PARENT_MAP[n];
                if (!pn || !bones[pn]) return null;
                const sel = selectedBoneName === n || selectedBoneName === pn;
                return (
                    <BoneStick key={`s-${n}`}
                        parentBone={bones[pn]} childBone={bones[n]}
                        boneName={n} isSelected={sel} isChain={chain.has(n) || chain.has(pn)} />
                );
            })}
            {names.map(n => (
                <JointSphere key={`j-${n}`} bone={bones[n]} boneName={n}
                    isSelected={selectedBoneName === n} isChain={chain.has(n)}
                    isEditable={editable} onSelect={onBoneSelect} />
            ))}
        </>
    );
}

/*

        const skinnedMesh = new THREE.SkinnedMesh(geo, mat);
        skinnedMesh.bind(sm.skeleton, sm.bindMatrix);
        return { mesh: skinnedMesh, skeleton: sm.skeleton, bindMatrix: sm.bindMatrix.clone() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatar, request.boneNames.join(','), request.offset, request.minWeight, request.color]);

    useEffect(() => {
        if (result) {
            onReady?.(result.mesh.geometry, result.skeleton, result.bindMatrix);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);

    if (!result) return null;
    return <primitive object={result.mesh} />;
}

// ── Floor grid ────────────────────────────────────────────────────────────────
*/

function FloorGrid() {
    return (
        <group position={[0, -0.93, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <circleGeometry args={[2.7, 64]} />
                <meshStandardMaterial color="#0e1510" roughness={0.92} metalness={0.04} />
            </mesh>
            {Array.from({ length: 9 }, (_, i) => i - 4).map(i => (
                <group key={i}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[i * 0.6, -0.015, 0]}>
                        <planeGeometry args={[0.005, 5.4]} />
                        <meshBasicMaterial color="#1a2e1d" transparent opacity={0.35} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, -0.015, i * 0.6]}>
                        <planeGeometry args={[0.005, 5.4]} />
                        <meshBasicMaterial color="#1a2e1d" transparent opacity={0.35} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// ── Scene content ─────────────────────────────────────────────────────────────
function SceneContent({
    garmentUrl, preset,
    selectedBoneName, editTarget = 'garment', transformMode = 'translate',
    showSkeleton = false, editable = false,
    onGarmentTransformChange, onBoneTransformChange,
    onBonesReady, onBoneDefaultsReady, onBoneSelect,
}: MaleSceneCanvasProps) {
    const { scene: baseScene } = useGLTF(MALE_BASE_MODEL_URL);
    const { scene: garmentScene } = useGLTF(garmentUrl);

    const avatar  = useMemo(() => cloneSkeleton(baseScene) as THREE.Group, [baseScene]);
    const garment = useMemo(() => prepareStatic(garmentScene), [garmentScene]);

    const garmentGroupRef    = useRef<THREE.Group>(null);
    const garmentControlsRef = useRef<any>(null);
    const boneControlsRef    = useRef<any>(null);
    const bonesRef           = useRef<Record<string, THREE.Bone>>({});
    const origPosesRef       = useRef<Record<string, BonePose>>({});
    const [dragging, setDragging]     = useState(false);
    const [bonesReady, setBonesReady] = useState(false);

    // ── Collect bones ─────────────────────────────────────────────────────────
    useEffect(() => {
        const next: Record<string, THREE.Bone> = {};
        const orig: Record<string, BonePose>   = {};
        let skeleton: THREE.Skeleton | null = null;

        avatar.traverse(child => {
            if (child instanceof THREE.Bone) {
                next[child.name] = child;
                orig[child.name] = {
                    position: [child.position.x, child.position.y, child.position.z],
                    rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
                };
            }
            if (child instanceof THREE.SkinnedMesh && !skeleton) {
                skeleton    = child.skeleton;
            }
        });

        bonesRef.current   = next;
        origPosesRef.current = orig;

        const avail = EDITABLE_MALE_BONES.filter(n => Boolean(next[n]));
        onBonesReady?.(avail);
        onBoneDefaultsReady?.(orig);
        setBonesReady(true);
    }, [avatar, onBoneDefaultsReady, onBonesReady]);

    // ── Garment transform from preset ─────────────────────────────────────────
    useEffect(() => {
        const g = garmentGroupRef.current;
        if (!g) return;
        g.position.set(...preset.garmentTransform.position);
        g.rotation.set(...preset.garmentTransform.rotation);
        g.scale.set(...preset.garmentTransform.scale);
    }, [preset.garmentTransform]);

    // ── Apply FK bone poses ───────────────────────────────────────────────────
    useEffect(() => {
        const bones = bonesRef.current;
        const orig  = origPosesRef.current;
        for (const [n, bone] of Object.entries(bones)) {
            const o = orig[n];
            if (o) { bone.position.set(...o.position); bone.rotation.set(...o.rotation); }
        }
        for (const [n, pose] of Object.entries(preset.avatarPose.bones)) {
            const bone = bones[n];
            if (bone) { bone.position.set(...pose.position); bone.rotation.set(...pose.rotation); }
        }
    }, [avatar, preset.avatarPose.bones]);

    // ── Garment gizmo events ──────────────────────────────────────────────────
    useEffect(() => {
        const ctrl = garmentControlsRef.current;
        if (!ctrl || !editable || editTarget !== 'garment') return;
        const commitTransform = () => {
            const g = garmentGroupRef.current;
            if (!g) return;
            onGarmentTransformChange?.(readGarmentTransform(g));
        };
        const onDrag = (e: { value?: boolean }) => {
            const isDragging = Boolean(e.value);
            setDragging(isDragging);
            if (!isDragging) commitTransform();
        };
        ctrl.addEventListener('dragging-changed', onDrag);
        ctrl.addEventListener('mouseUp', commitTransform);
        return () => {
            ctrl.removeEventListener('dragging-changed', onDrag);
            ctrl.removeEventListener('mouseUp', commitTransform);
        };
    }, [editTarget, editable, onGarmentTransformChange]);

    // ── Bone gizmo events ─────────────────────────────────────────────────────
    const selectedBone = selectedBoneName ? bonesRef.current[selectedBoneName] ?? null : null;

    useEffect(() => {
        const ctrl = boneControlsRef.current;
        if (!ctrl || !editable || editTarget !== 'bone' || !selectedBone) return;
        const commitTransform = () => {
            if (!selectedBone) return;
            onBoneTransformChange?.(selectedBone.name, readTransform(selectedBone));
        };
        const onDrag = (e: { value?: boolean }) => {
            const isDragging = Boolean(e.value);
            setDragging(isDragging);
            if (!isDragging) commitTransform();
        };
        ctrl.addEventListener('dragging-changed', onDrag);
        ctrl.addEventListener('mouseUp', commitTransform);
        return () => {
            ctrl.removeEventListener('dragging-changed', onDrag);
            ctrl.removeEventListener('mouseUp', commitTransform);
        };
    }, [editTarget, editable, onBoneTransformChange, selectedBone]);

    const handleBoneSelect = useCallback((n: string) => onBoneSelect?.(n), [onBoneSelect]);

    return (
        <>
            <color attach="background" args={['#06090a']} />
            <fog attach="fog" args={['#06090a', 7, 16]} />

            {/* Lighting */}
            <ambientLight intensity={0.7} />
            <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#102214" />
            <directionalLight position={[3.8, 5.5, 3.6]} intensity={2.2} color="#f8fff5" castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-3.5, 2.8, 2.5]} intensity={1.0} color="#8df6a5" />
            <pointLight position={[0, 1.5, 2.5]} intensity={1.1} color="#d6ffe1" />
            <spotLight position={[0, 6, 0]} angle={0.4} penumbra={0.5} intensity={1.3} color="#d7ffdb" />
            <pointLight position={[0, 2.5, -2.5]} intensity={0.6} color="#2af5a2" />

            <FloorGrid />

            {/* ── Avatar + static garment ──────────────────────────────────── */}
            <group position={[0, -0.93, 0]}>
                <primitive object={avatar} />

                {/* Static garment — no skinning, positioned via gizmo */}
                <group ref={garmentGroupRef}>
                    <primitive object={garment} />
                </group>
            </group>

            {/* ── Skeleton overlay (FK chain highlighting) ─────────────────── */}
            {(showSkeleton || (editable && editTarget === 'bone')) && bonesReady && (
                <SkeletonOverlay
                    bones={bonesRef.current}
                    selectedBoneName={selectedBoneName ?? null}
                    editable={editable}
                    onBoneSelect={handleBoneSelect}
                />
            )}

            {/* Garment gizmo */}
            {editable && editTarget === 'garment' && garmentGroupRef.current ? (
                <TransformControls
                    ref={garmentControlsRef}
                    object={garmentGroupRef.current}
                    mode={transformMode}
                />
            ) : null}

            {/* Bone rotate gizmo (FK) */}
            {editable && editTarget === 'bone' && selectedBone ? (
                <TransformControls
                    ref={boneControlsRef}
                    object={selectedBone}
                    mode="rotate"
                    size={0.72}
                />
            ) : null}

            {/* Orbit controls — disabled while dragging gizmo */}
            <OrbitControls
                enabled={!dragging}
                makeDefault
                target={[0, 0.8, 0]}
                minDistance={1.6} maxDistance={6.5}
                minPolarAngle={0.2} maxPolarAngle={Math.PI - 0.15}
                enableDamping dampingFactor={0.08}
            />
        </>
    );
}

// ── Public component ──────────────────────────────────────────────────────────
export function MaleSceneCanvas(props: MaleSceneCanvasProps) {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas
                camera={{ position: [0, 1.2, 3.3], fov: 34 }}
                shadows
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
            >
                <Suspense fallback={
                    <Html center>
                        <div style={{
                            padding: '10px 18px', borderRadius: 12,
                            background: 'rgba(8,12,10,0.88)',
                            border: '1px solid rgba(125,255,143,0.2)',
                            color: '#d8ffe1', fontSize: 12,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                        }}>Loading 3D Scene…</div>
                    </Html>
                }>
                    <SceneContent {...props} />
                </Suspense>
            </Canvas>
        </div>
    );
}

useGLTF.preload(MALE_BASE_MODEL_URL);
