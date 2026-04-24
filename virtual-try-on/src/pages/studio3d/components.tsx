import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, TransformControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { applyTextureQuality, createDecalPlacement, pickBestModelHit } from './utils';
import type { CaptureRequest, LightConfig, TShirt3DProps } from './types';

export function SingleLight({ l, isSelected, showGizmos, updLight, setExpandedId }: { l: LightConfig; isSelected: boolean; showGizmos: boolean; updLight: (id: string, updates: Partial<LightConfig>) => void; setExpandedId: (id: string | null) => void }) {
    const { controls } = useThree();
    const groupRef = useRef<THREE.Group>(null!);

    const maxA = Math.max(Math.abs(l.x), Math.abs(l.y), Math.abs(l.z), 0.001);
    const s = l.type === 'directional' ? 2.8 / maxA : 1;
    const gx = l.type === 'directional' ? l.x * s : l.x * 0.35;
    const gy = l.type === 'directional' ? l.y * s : l.y * 0.35;
    const gz = l.type === 'directional' ? l.z * s : l.z * 0.35;

    const onDrag = () => {
        const p = groupRef.current.position;
        const nx = l.type === 'directional' ? p.x / s : p.x / 0.35;
        const ny = l.type === 'directional' ? p.y / s : p.y / 0.35;
        const nz = l.type === 'directional' ? p.z / s : p.z / 0.35;
        updLight(l.id, { x: nx, y: ny, z: nz });
    };

    return (
        <group>
            {isSelected && (
                <TransformControls
                    object={groupRef.current}
                    mode="translate"
                    onMouseDown={() => { if (controls) (controls as any).enabled = false; }}
                    onMouseUp={() => { if (controls) (controls as any).enabled = true; }}
                    onObjectChange={onDrag}
                />
            )}
            <group ref={groupRef} position={[gx, gy, gz]} onClick={(e) => { e.stopPropagation(); setExpandedId(l.id); }}>
                {l.enabled && (
                    l.type === 'directional' ? <directionalLight position={[0, 0, 0]} intensity={l.intensity} color={l.color} castShadow /> :
                    l.type === 'point' ? <pointLight position={[0, 0, 0]} intensity={l.intensity} color={l.color} /> :
                    <spotLight position={[0, 0, 0]} intensity={l.intensity} color={l.color} angle={0.4} />
                )}
                {showGizmos && (
                    <group>
                        <mesh>
                            <sphereGeometry args={[isSelected ? 0.08 : 0.06, 16, 16]} />
                            <meshBasicMaterial color={l.color} />
                        </mesh>
                        <mesh>
                            <sphereGeometry args={[isSelected ? 0.22 : 0.12, 16, 16]} />
                            <meshBasicMaterial color={l.color} wireframe transparent opacity={isSelected ? 0.4 : 0.15} />
                        </mesh>
                        <mesh visible={false}>
                            <sphereGeometry args={[0.3, 16, 16]} />
                            <meshBasicMaterial transparent opacity={0} />
                        </mesh>
                    </group>
                )}
            </group>
        </group>
    );
}

export function DynamicLights({ lights, showGizmos, expandedLightId, updLight, setExpandedId }: { lights: LightConfig[]; showGizmos: boolean; expandedLightId: string | null; updLight: (id: string, updates: Partial<LightConfig>) => void; setExpandedId: (id: string | null) => void }) {
    return (<>
        <ambientLight intensity={0.5} color="#ffffff" />
        {lights.filter(l => l.enabled).map(l => (
            <SingleLight
                key={l.id}
                l={l}
                isSelected={showGizmos && l.id === expandedLightId}
                showGizmos={showGizmos}
                updLight={updLight}
                setExpandedId={setExpandedId}
            />
        ))}
    </>);
}

export function SceneBg({ color }: { color: string }) {
    const { scene } = useThree();
    useEffect(() => { scene.background = new THREE.Color(color); }, [color, scene]);
    return null;
}

type SceneCapturerProps = { requestRef: MutableRefObject<((req: CaptureRequest) => void) | null> };

export function SceneCapturer({ requestRef }: SceneCapturerProps) {
    const { gl, scene, camera } = useThree();
    useEffect(() => {
        requestRef.current = (req: CaptureRequest) => {
            if (req.type === 'glb') {
                const exporter = new GLTFExporter();
                exporter.parse(
                    scene,
                    (result) => {
                        const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `studio3d-model-${Date.now()}.glb`;
                        a.click();
                        URL.revokeObjectURL(url);
                    },
                    (err) => console.error('GLTFExporter error:', err),
                    { binary: true, embedImages: true }
                );
                return;
            }

            gl.render(scene, camera);
            const canvas = gl.domElement;
            const mime = req.type === 'jpeg' ? 'image/jpeg' : 'image/png';
            const ext = req.type === 'jpeg' ? 'jpg' : 'png';
            const quality = req.quality ?? (req.type === 'jpeg' ? 0.95 : undefined);
            canvas.toBlob((blob: Blob | null) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `studio3d-render-${Date.now()}.${ext}`;
                a.click();
                URL.revokeObjectURL(url);
            }, mime, quality);
        };
        return () => { requestRef.current = null; };
    }, [gl, scene, camera, requestRef]);
    return null;
}

export function TShirt3D({ modelUrl, flipNormals, fixRotation, modelScale, partCanvases, setAvailableParts, decals, placementMode, pendingTexture, pendingPaint, onDecalPlaced, onPaintPlaced, selDecalId, selPaintId, onDecalMove, onPaintMove, onModelClick, isMovingElement, onMoveElement, isMovingPaint, onMovePaint, isWalking, spin }: TShirt3DProps) {
    const texRefs = useRef<Record<string, THREE.CanvasTexture>>({});
    const modelRootRef = useRef<THREE.Group>(null!);
    const cameraInitialized = useRef(false);
    const { camera, controls, raycaster } = useThree();
    const altPressed = useRef(false);
    const walkBlend = useRef(0);
    const isPointerDown = useRef(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => { if (e.key === 'Alt') { e.preventDefault(); altPressed.current = true; } };
        const up = (e: KeyboardEvent) => { if (e.key === 'Alt') altPressed.current = false; };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    const { scene } = useGLTF(modelUrl);

    const model = useMemo(() => {
        if (!scene) return null;
        const clone = cloneSkeleton(scene);
        clone.scale.set(1, 1, 1);
        clone.position.set(0, 0, 0);
        
        if (flipNormals) {
            clone.traverse((child) => {
                const mesh = child as THREE.Mesh;
                if (!mesh.isMesh) return;
                const geo = mesh.geometry;
                if ((geo as any).__normalsFlipped) return;
                (geo as any).__normalsFlipped = true;
                if (geo.index) {
                    for (let i = 0; i < geo.index.count; i += 3) {
                        const tmp = geo.index.getX(i + 1);
                        geo.index.setX(i + 1, geo.index.getX(i + 2));
                        geo.index.setX(i + 2, tmp);
                    }
                    geo.index.needsUpdate = true;
                }
                const normals = geo.attributes.normal;
                if (normals) {
                    for (let i = 0; i < normals.count; i++) {
                        normals.setXYZ(i, -normals.getX(i), -normals.getY(i), -normals.getZ(i));
                    }
                    normals.needsUpdate = true;
                }
            });
        }
        if (fixRotation) clone.rotation.set(fixRotation[0], fixRotation[1], fixRotation[2]);
        return clone;
    }, [scene, flipNormals, fixRotation]);

    const { targetScale, positionY } = useMemo(() => {
        if (!model) return { targetScale: 1, positionY: 0 };
        const b = new THREE.Box3().setFromObject(model);
        const sz = new THREE.Vector3();
        b.getSize(sz);
        let ts = 2.2;
        if (modelScale) ts *= modelScale;
        const finalScale = ts / Math.max(sz.x, sz.y, sz.z, 0.001);
        
        const c = new THREE.Vector3();
        b.getCenter(c);
        const posY = -c.y * finalScale - 0.2;
        
        return { targetScale: finalScale, positionY: posY };
    }, [model, modelScale]);

    useEffect(() => { cameraInitialized.current = false; }, [modelUrl]);

    useEffect(() => {
        if (!model || cameraInitialized.current) return;
        const b = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        b.getSize(size);
        const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
        const scaledHeight = size.y * targetScale;
        const optimalDist = (scaledHeight / 2) / Math.tan(fov / 2) * 1.15;
        const camY = 0; // Model is centered at 0 in JSX
        camera.position.set(0, camY, optimalDist);
        camera.lookAt(0, camY, 0);
        camera.updateProjectionMatrix();
        if (controls) {
            (controls as any).target.set(0, camY, 0);
            (controls as any).update();
        }
        cameraInitialized.current = true;
    }, [model, camera, controls, targetScale]);

    const lastAzimuth = useRef(0);
    const swingFactor = useRef(0);

    const bonesData = useMemo(() => {
        if (!model) return [];
        const data: { bone: THREE.Bone; initZ: number; initX: number; sign: number }[] = [];
        model.traverse((child) => {
            if ((child as THREE.Bone).isBone && child.parent && child.parent.type === 'Bone') {
                const bone = child as THREE.Bone;
                const isRight = bone.position.x < 0 || bone.name.toLowerCase().includes('r');
                data.push({ bone, initZ: bone.rotation.z, initX: bone.rotation.x, sign: isRight ? -1 : 1 });
            }
        });
        return data;
    }, [model]);

    useEffect(() => {
        if (!model) return;
        const parts: string[] = [];
        model.traverse((child: any) => {
            if (child.isMesh) {
                if (!child.name) child.name = `Part_${parts.length + 1}`;
                if (!parts.includes(child.name)) parts.push(child.name);
            }
        });
        setAvailableParts([...parts]);
    }, [model, setAvailableParts]);

    useEffect(() => {
        if (!model) return;

        model.traverse((child: any) => {
            if (!child.isMesh) return;
            const partName = child.name;

            if (!texRefs.current[partName]) {
                if (!partCanvases[partName]) {
                    const cvs = document.createElement('canvas');
                    cvs.width = 2048;
                    cvs.height = 2048;
                    partCanvases[partName] = cvs;
                }
                const tex = applyTextureQuality(new THREE.CanvasTexture(partCanvases[partName]));
                tex.flipY = false;
                tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
                texRefs.current[partName] = tex;
            }
            const tex = texRefs.current[partName];

            const raw = child.material;
            const mats: any[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [new THREE.MeshStandardMaterial()];
            const cloned = mats.map((m: any) => {
                const c = (m && typeof m.clone === 'function') ? m.clone() : new THREE.MeshStandardMaterial();
                c.map = tex;
                c.side = THREE.DoubleSide;
                c.transparent = false;
                c.opacity = 1;
                c.alphaTest = 0;
                c.depthWrite = true;
                c.alphaMap = null;
                c.needsUpdate = true;
                return c;
            });
            child.material = cloned.length === 1 ? cloned[0] : cloned;
        });

        window.dispatchEvent(new CustomEvent('tex-sync'));
        return () => {
            Object.values(texRefs.current).forEach(t => t.dispose());
            texRefs.current = {};
        };
    }, [model, partCanvases]);

    useEffect(() => {
        const update = () => {
            Object.values(texRefs.current).forEach(tex => { tex.needsUpdate = true; });
        };
        window.addEventListener('tex-sync', update);
        update();
        return () => window.removeEventListener('tex-sync', update);
    }, []);

    useFrame((state, delta) => {
        if (!modelRootRef.current) return;

        const target = isWalking ? 1 : 0;
        walkBlend.current = THREE.MathUtils.damp(walkBlend.current, target, 7, delta);

        if (spin) {
            modelRootRef.current.rotation.y += 0.006;
        }

        if (walkBlend.current > 0.001) {
            const t = state.clock.getElapsedTime();
            const bob = Math.sin(t * 4.5) * 0.022 * walkBlend.current;
            const sway = Math.sin(t * 4.5 + Math.PI / 2) * 0.018 * walkBlend.current;
            modelRootRef.current.position.y = positionY + bob;
            modelRootRef.current.rotation.z = sway * 0.45;
            modelRootRef.current.rotation.x = -Math.abs(sway) * 0.18;
            if (bonesData.length > 0) {
                const azimuth = modelRootRef.current.rotation.y;
                const swing = Math.sin(azimuth * 2 + lastAzimuth.current) * 0.008 * walkBlend.current;
                swingFactor.current = swing;
                bonesData.forEach(({ bone, initZ, initX, sign }) => {
                    bone.rotation.z = initZ + swing * sign;
                    bone.rotation.x = initX + Math.abs(swing) * 0.22;
                });
                lastAzimuth.current = azimuth;
            }
        } else {
            modelRootRef.current.position.y = positionY;
            modelRootRef.current.rotation.z = 0;
            modelRootRef.current.rotation.x = 0;
        }
    });

    const decalMeshes = useMemo(() => decals.map((d) => {
        let targetMesh: THREE.Mesh | null = null;
        let bestDist = Infinity;
        model?.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const center = new THREE.Vector3();
                new THREE.Box3().setFromObject(mesh).getCenter(center);
                const dist = center.distanceTo(d.position);
                if (dist < bestDist) { bestDist = dist; targetMesh = mesh; }
            }
        });
        if (!targetMesh) return null;

        try {
            const mesh = targetMesh as THREE.Mesh;
            mesh.updateMatrixWorld(true);
            const geo = new DecalGeometry(mesh, d.position, d.rotation, d.scale);
            return (
                <mesh key={d.id} geometry={geo} renderOrder={10}>
                    <meshStandardMaterial
                        map={d.texture}
                        transparent
                        depthTest
                        depthWrite={false}
                        polygonOffset
                        polygonOffsetFactor={-4}
                        side={THREE.FrontSide}
                        alphaTest={0.05}
                    />
                </mesh>
            );
        } catch {
            return null;
        }
    }), [decals, model]);

    return (
        <group ref={modelRootRef} scale={targetScale} position={[0, positionY, 0]}>
            <primitive
                object={model as THREE.Object3D}
                onClick={(e: any) => {
                    e.stopPropagation();
                    if (pendingPaint) {
                        const hit = pickBestModelHit(e.intersections ?? [], model as THREE.Object3D) ?? e.intersections?.find((i: any) => i?.uv != null);
                        const uv = hit?.uv;
                        const partName = hit?.object?.name || 'default';
                        if (uv) onPaintPlaced(partName, uv.x, uv.y);
                        else console.warn('Paint mode: no UV found at this point.');
                        return;
                    }
                    // Mobile: move existing paint layer by click (no Alt needed)
                    if (isMovingPaint && selPaintId && onMovePaint) {
                        const hit = pickBestModelHit(e.intersections ?? [], model as THREE.Object3D) ?? e.intersections?.find((i: any) => i?.uv != null);
                        const uv = hit?.uv;
                        const partName = hit?.object?.name || 'default';
                        if (uv) onMovePaint(partName, uv.x, uv.y);
                        else console.warn('Move paint: no UV found.');
                        return;
                    }
                    if (altPressed.current && selPaintId) {
                        const hit = pickBestModelHit(e.intersections ?? [], model as THREE.Object3D) ?? e.intersections?.find((i: any) => i?.uv != null);
                        const uv = hit?.uv;
                        const partName = hit?.object?.name || 'default';
                        if (uv) onPaintMove(selPaintId, { partName, u: uv.x, v: uv.y });
                        else console.warn('Paint move: no UV found at this point.');
                        return;
                    }
                    if (placementMode && pendingTexture) {
                        const hit = pickBestModelHit(e.intersections ?? [], model as THREE.Object3D);
                        const placement = createDecalPlacement(hit, model as THREE.Object3D);
                        if (placement) onDecalPlaced({ ...placement, texture: pendingTexture, label: 'Print' });
                        return;
                    }
                    if (altPressed.current && selDecalId) {
                        const currentDecal = decals.find(d => d.id === selDecalId);
                        const hit = pickBestModelHit(e.intersections ?? [], model as THREE.Object3D);
                        const placement = createDecalPlacement(hit, model as THREE.Object3D, currentDecal?.scale);
                        if (placement) {
                            onDecalMove(selDecalId, {
                                position: placement.position,
                                rotation: placement.rotation,
                            });
                        }
                        return;
                    }
                    if (placementMode && pendingTexture) {
                        const intersections: any[] = e.intersections ?? [];
                        const modelBox = new THREE.Box3().setFromObject(model as THREE.Object3D);
                        const modelVol = (() => { const s = new THREE.Vector3(); modelBox.getSize(s); return s.x * s.y * s.z; })();
                        const minVol = modelVol * 0.015;

                        let bestHit: any = null;
                        let bestVol = -1;
                        for (const ix of intersections) {
                            if (!ix.face || !ix.object) continue;
                            const m = ix.object as THREE.Mesh;
                            if (!m.isMesh) continue;
                            const box = new THREE.Box3().setFromObject(m);
                            const bsz = new THREE.Vector3();
                            box.getSize(bsz);
                            const vol = bsz.x * bsz.y * bsz.z;
                            if (vol < minVol) continue;
                            if (vol > bestVol) { bestVol = vol; bestHit = ix; }
                        }

                        if (!bestHit && intersections.length > 0) {
                            bestHit = intersections.reduce((best: any, ix: any) => {
                                if (!ix.object?.isMesh) return best;
                                const box = new THREE.Box3().setFromObject(ix.object);
                                const s = new THREE.Vector3(); box.getSize(s);
                                const vol = s.x * s.y * s.z;
                                const bBox = best ? new THREE.Box3().setFromObject(best.object) : null;
                                const bs = new THREE.Vector3(); bBox?.getSize(bs);
                                const bVol = bBox ? bs.x * bs.y * bs.z : -1;
                                return vol > bVol ? ix : best;
                            }, null);
                        }

                        const hit = bestHit;
                        if (hit && hit.face && hit.object) {
                            const mesh = hit.object as THREE.Mesh;
                            mesh.updateMatrixWorld(true);
                            const position = hit.point.clone();
                            const normal = hit.face.normal.clone().transformDirection(mesh.matrixWorld).normalize();
                            const worldUp = Math.abs(normal.y) < 0.98 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
                            const right = new THREE.Vector3().crossVectors(worldUp, normal).normalize();
                            const up = new THREE.Vector3().crossVectors(normal, right).normalize();
                            const m = new THREE.Matrix4().makeBasis(right, up, normal);
                            const rotation = new THREE.Euler().setFromRotationMatrix(m, 'XYZ');
                            const bbox = new THREE.Box3().setFromObject(model as THREE.Object3D);
                            const bsz = new THREE.Vector3();
                            bbox.getSize(bsz);
                            const s = bsz.x * 0.2;
                            const scale = new THREE.Vector3(s, s, s * 0.15);
                            onDecalPlaced({ position, rotation, scale, texture: pendingTexture, label: 'Print' });
                        }
                        return;
                    }

                    if (!altPressed.current && !isMovingElement) return;

                    let uv = e.uv ?? e.intersections?.find((i: any) => i.uv != null)?.uv;
                    if (!uv && model) {
                        const hits = raycaster.intersectObject(model, true);
                        const hit = hits.find((h: any) => h.uv != null);
                        if (hit) uv = hit.uv;
                    }

                    if (uv) {
                        console.log(`UV click → u=${uv.x.toFixed(3)} v=${uv.y.toFixed(3)}  tex=(${Math.round(uv.x * 2048)}, ${Math.round(uv.y * 2048)})`);
                        if (isMovingElement && onMoveElement) onMoveElement(uv.x, uv.y, false);
                        else onModelClick(uv.x, uv.y);
                    } else {
                        console.warn('Click/Alt+click: no UV found at this point.');
                    }
                }}
                onPointerDown={() => {
                    if (isMovingElement || isMovingPaint) {
                        isPointerDown.current = true;
                        if (controls) (controls as any).enabled = false;
                    }
                }}
                onPointerUp={() => {
                    isPointerDown.current = false;
                    if (controls) (controls as any).enabled = true;
                }}
                onPointerMove={(e: any) => {
                    if (isMovingElement && isPointerDown.current && onMoveElement) {
                        let uv = e.uv ?? e.intersections?.find((i: any) => i.uv != null)?.uv;
                        if (uv) onMoveElement(uv.x, uv.y, true);
                    }
                }}
            />
            {decalMeshes}
        </group>
    );
}

export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
    useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', padding: '10px 22px', borderRadius: 30, fontSize: 13, fontWeight: 700, boxShadow: '0 8px 30px rgba(22,163,74,0.45)', zIndex: 9999, whiteSpace: 'nowrap', fontFamily: "'Inter','Segoe UI',sans-serif" }}
        >{msg}</motion.div>
    );
}
