import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminSceneAPI } from '../api/client';
import { MaleSceneCanvas } from '../components/maleScene/MaleSceneCanvas';
import { useOutfitStore } from '../store';
import type { BonePose, MaleGarmentPreset, MaleSceneStore, Vector3Tuple } from '../features/maleScene/config';
import {
    createDefaultMaleGarmentPreset,
    createDefaultMaleSceneStore,
    findMaleGarmentById,
    MALE_BONE_GROUPS,
    MALE_GARMENTS,
} from '../features/maleScene/config';

// ── CSS animations injected once ─────────────────────────────────────────────
const ADMIN_ANIM_STYLE = `
@keyframes ams-fadeSlideIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ams-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ams-pulse-green {
  0%,100% { box-shadow: 0 0 0 0 rgba(125,255,143,0); }
  50%      { box-shadow: 0 0 12px 3px rgba(125,255,143,0.28); }
}
@keyframes ams-spin {
  to { transform: rotate(360deg); }
}
.ams-panel {
  animation: ams-fadeSlideIn 0.38s cubic-bezier(0.22,0.9,0.36,1) both;
}
.ams-section {
  animation: ams-fadeSlideIn 0.45s cubic-bezier(0.22,0.9,0.36,1) both;
}
.ams-bone-btn {
  transition: background 0.18s, border-color 0.18s, transform 0.14s, box-shadow 0.18s;
}
.ams-bone-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.32);
}
.ams-bone-btn-active {
  animation: ams-pulse-green 1.8s ease-in-out infinite;
}
.ams-garment-btn {
  transition: background 0.16s, border-color 0.16s, transform 0.12s;
}
.ams-garment-btn:hover {
  transform: translateY(-1px);
}
.ams-save-btn {
  transition: opacity 0.2s, transform 0.15s;
}
.ams-save-btn:not(:disabled):hover {
  transform: scale(1.04);
}
.ams-spinner {
  display:inline-block;
  width:12px; height:12px;
  border:2px solid rgba(255,255,255,0.3);
  border-top-color:#fff;
  border-radius:50%;
  animation: ams-spin 0.7s linear infinite;
  margin-right:6px;
  vertical-align:middle;
}
.ams-notice-enter {
  animation: ams-fadeSlideIn 0.3s ease both;
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = ADMIN_ANIM_STYLE;
    if (!document.head.querySelector('#ams-styles')) {
        style.id = 'ams-styles';
        document.head.appendChild(style);
    }
}



const layoutShell: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, rgba(28,78,37,0.24) 0%, rgba(5,8,6,1) 52%)',
    color: '#f3fff5',
};

const panelStyle: React.CSSProperties = {
    background: 'rgba(7,10,8,0.88)',
    border: '1px solid rgba(125,255,143,0.12)',
    borderRadius: 20,
    boxShadow: '0 30px 70px rgba(0,0,0,0.32)',
};

const sectionStyle: React.CSSProperties = {
    ...panelStyle,
    padding: 18,
    display: 'grid',
    gap: 14,
};

const labelStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#8eb696',
    fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 12px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#f5fff6',
    outline: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
};

const actionButton = (active = false): React.CSSProperties => ({
    padding: '10px 12px',
    borderRadius: 12,
    border: active ? '1px solid rgba(125,255,143,0.44)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(125,255,143,0.16)' : 'rgba(255,255,255,0.03)',
    color: active ? '#cffff0' : '#d8e7da',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 13,
});

const categoryLabels: Record<string, string> = {
    tops: 'Tops',
    outerwear: 'Outerwear',
    bottoms: 'Bottoms',
    underwear: 'Underwear',
    footwear: 'Footwear',
};

const groupedGarments = MALE_GARMENTS.reduce<Record<string, typeof MALE_GARMENTS>>((acc, item) => {
    if (!acc[item.category]) {
        acc[item.category] = [];
    }

    acc[item.category].push(item);
    return acc;
}, {});

const toDegrees = (value: number) => (value * 180) / Math.PI;
const toRadians = (value: number) => (value * Math.PI) / 180;
const fixed = (value: number, digits = 3) => Number(value.toFixed(digits));

function VectorInputs({
    label,
    value,
    step,
    onChange,
}: {
    label: string;
    value: Vector3Tuple;
    step: number;
    onChange: (next: Vector3Tuple) => void;
}) {
    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <div style={labelStyle}>{label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(['X', 'Y', 'Z'] as const).map((axis, index) => (
                    <label key={axis} style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#7f9b85', fontWeight: 700 }}>{axis}</span>
                        <input
                            type="number"
                            step={step}
                            value={fixed(value[index])}
                            onChange={(event) => {
                                const next = [...value] as Vector3Tuple;
                                next[index] = Number(event.target.value);
                                onChange(next);
                            }}
                            style={inputStyle}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}

function RotationInputs({
    label,
    value,
    onChange,
}: {
    label: string;
    value: Vector3Tuple;
    onChange: (next: Vector3Tuple) => void;
}) {
    const displayValue: Vector3Tuple = [
        fixed(toDegrees(value[0]), 1),
        fixed(toDegrees(value[1]), 1),
        fixed(toDegrees(value[2]), 1),
    ];

    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <div style={labelStyle}>{label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(['X', 'Y', 'Z'] as const).map((axis, index) => (
                    <label key={axis} style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#7f9b85', fontWeight: 700 }}>{axis}</span>
                        <input
                            type="number"
                            step={1}
                            value={displayValue[index]}
                            onChange={(event) => {
                                const next = [...value] as Vector3Tuple;
                                next[index] = toRadians(Number(event.target.value));
                                onChange(next);
                            }}
                            style={inputStyle}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}

export function AdminMaleScene() {
    const { token: siteToken, user: siteUser, logout: siteLogout } = useOutfitStore();
    const navigate = useNavigate();

    const [sceneStore, setSceneStore] = useState<MaleSceneStore | null>(null);
    const [selectedGarmentId, setSelectedGarmentId] = useState(MALE_GARMENTS[0]?.id ?? '');
    const [selectedBoneName, setSelectedBoneName] = useState<string | null>(null);
    const [availableBones, setAvailableBones] = useState<string[]>([]);
    const [boneDefaults, setBoneDefaults] = useState<Record<string, BonePose>>({});
    const [editTarget, setEditTarget] = useState<'garment' | 'bone'>('garment');
    const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [autoSkin, setAutoSkin] = useState(true);
    const [loadingScene, setLoadingScene] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isDirty, setIsDirty] = useState(false);



    const isAdmin = siteUser?.role === 'admin';
    const adminToken = siteToken;

    const selectedGarment = findMaleGarmentById(selectedGarmentId) ?? MALE_GARMENTS[0] ?? null;
    const selectedPreset = useMemo(() => {
        if (!selectedGarment) {
            return null;
        }

        return sceneStore?.garments[selectedGarment.id] ?? createDefaultMaleGarmentPreset(selectedGarment);
    }, [sceneStore, selectedGarment]);

    const selectedBonePose = selectedBoneName
        ? selectedPreset?.avatarPose.bones[selectedBoneName] ?? boneDefaults[selectedBoneName] ?? { position: [0, 0, 0], rotation: [0, 0, 0] }
        : null;

    useEffect(() => {
        if (!adminToken || !isAdmin) {
            setLoadingScene(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoadingScene(true);
            try {
                const store = await adminSceneAPI.getMenSceneForAdmin(adminToken);

                if (cancelled) {
                    return;
                }

                setSceneStore(store);
                setSelectedGarmentId(store.featuredGarmentId ?? MALE_GARMENTS[0]?.id ?? '');
                setIsDirty(false);
                setError('');
            } catch (loadError: any) {
                if (cancelled) {
                    return;
                }

                if (loadError?.response?.status === 401 || loadError?.response?.status === 403) {
                    setError('Access denied. Admin role required.');
                } else {
                    setError(loadError?.response?.data?.error || 'Failed to load scene presets.');
                }
                setSceneStore(null);
            } finally {
                if (!cancelled) {
                    setLoadingScene(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [adminToken]);

    useEffect(() => {
        if (!selectedBoneName && availableBones.length > 0) {
            setSelectedBoneName(availableBones[0]);
        }
    }, [availableBones, selectedBoneName]);

    const mutateSceneStore = (mutator: (current: MaleSceneStore) => MaleSceneStore) => {
        setSceneStore((current) => {
            if (!current) {
                return current;
            }

            return mutator(current);
        });
        setIsDirty(true);
        setNotice('');
    };

    const mutateSelectedPreset = (mutator: (preset: MaleGarmentPreset) => MaleGarmentPreset) => {
        if (!selectedGarment) {
            return;
        }

        mutateSceneStore((current) => {
            const basePreset = current.garments[selectedGarment.id] ?? createDefaultMaleGarmentPreset(selectedGarment);
            const nextPreset = mutator(basePreset);

            return {
                ...current,
                updatedAt: new Date().toISOString(),
                garments: {
                    ...current.garments,
                    [selectedGarment.id]: {
                        ...nextPreset,
                        garmentId: selectedGarment.id,
                        garmentName: selectedGarment.name,
                        garmentUrl: selectedGarment.url,
                        category: selectedGarment.category,
                        updatedAt: new Date().toISOString(),
                    },
                },
            };
        });
    };



    const handleSave = async () => {
        if (!adminToken || !sceneStore) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const saved = await adminSceneAPI.saveMenScene(adminToken, sceneStore);
            setSceneStore(saved);
            setIsDirty(false);
            setNotice('Men scene presets saved successfully.');
        } catch (saveError: any) {
            setError(saveError?.response?.data?.error || 'Unable to save men scene presets.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        siteLogout();
        navigate('/login');
    };

    const handleGarmentTransformChange = (transform: MaleGarmentPreset['garmentTransform']) => {
        mutateSelectedPreset((preset) => ({ ...preset, garmentTransform: transform }));
    };

    const handleBoneTransformChange = (boneName: string, pose: BonePose) => {
        mutateSelectedPreset((preset) => ({
            ...preset,
            avatarPose: {
                bones: {
                    ...preset.avatarPose.bones,
                    [boneName]: pose,
                },
            },
        }));
    };

    const ensureSceneStore = sceneStore ?? createDefaultMaleSceneStore();

    if (loadingScene) {
        return (
            <div style={{ ...layoutShell, display: 'grid', placeItems: 'center' }}>
                <div style={{ ...panelStyle, padding: 24, minWidth: 280, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#97d3a1' }}>
                        Loading Admin Scene
                    </div>
                </div>
            </div>
        );
    }

    if (!adminToken || !isAdmin) {
        return (
            <div style={{ ...layoutShell, display: 'grid', placeItems: 'center', padding: 24 }}>
                <div style={{ ...panelStyle, width: 'min(460px, 100%)', padding: 28, display: 'grid', gap: 18, textAlign: 'center' }}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div style={{ fontSize: 48 }}>🔒</div>
                        <h1 style={{ margin: 0, fontSize: 30 }}>Access Denied</h1>
                        <p style={{ margin: 0, color: '#92a497', lineHeight: 1.7 }}>
                            The Men Scene Editor is only available to administrators. 
                            Please log in with an admin account on the main site.
                        </p>
                    </div>
                    
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <button style={{ ...actionButton(true), width: '100%', padding: '14px' }}>
                            Go to Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!sceneStore || !selectedGarment || !selectedPreset) {
        return (
            <div style={{ ...layoutShell, display: 'grid', placeItems: 'center', padding: 24 }}>
                <div style={{ ...panelStyle, padding: 28, textAlign: 'center' }}>
                   {error ? (
                        <div style={{ color: '#ffc1c1' }}>{error}</div>
                   ) : (
                        <div style={{ color: '#97d3a1' }}>Searching for scene configuration...</div>
                   )}
                </div>
            </div>
        );
    }

    return (
        <div style={layoutShell}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#97d3a1', fontWeight: 800 }}>
                        Admin Workspace
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Male Clothing Scene Presets</div>
                    <div style={{ color: '#89a18f', fontSize: 14 }}>
                        Featured garment for users: <strong style={{ color: '#f6fff7' }}>{findMaleGarmentById(ensureSceneStore.featuredGarmentId)?.name ?? 'Not pinned yet'}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link to="/showroom/men" style={{ textDecoration: 'none' }}>
                        <button style={actionButton(false)}>Open User View</button>
                    </Link>
                    <button
                        onClick={() => {
                            mutateSceneStore((current) => ({
                                ...current,
                                featuredGarmentId: selectedGarment.id,
                                updatedAt: new Date().toISOString(),
                            }));
                            setNotice('Selected garment marked as the default scene for users.');
                        }}
                        style={actionButton(ensureSceneStore.featuredGarmentId === selectedGarment.id)}
                    >
                        Pin For Users
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{ ...actionButton(true), opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
                    </button>
                    <button onClick={handleLogout} style={actionButton(false)}>Logout</button>
                </div>
            </div>

            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'minmax(420px, 1.4fr) minmax(360px, 1fr)', gap: 20 }}>
                <div style={{ ...panelStyle, minHeight: 'calc(100vh - 160px)', overflow: 'hidden', position: 'relative' }} className="ams-panel">
                    <div style={{ height: '100%', minHeight: 640 }}>
                        <MaleSceneCanvas
                            garmentUrl={selectedGarment.url}
                            preset={selectedPreset}
                            selectedBoneName={selectedBoneName}
                            editTarget={editTarget}
                            transformMode={transformMode}
                            showSkeleton={showSkeleton}
                            editable
                            onGarmentTransformChange={handleGarmentTransformChange}
                            onBoneTransformChange={handleBoneTransformChange}
                            onBonesReady={setAvailableBones}
                            onBoneDefaultsReady={setBoneDefaults}
                            onBoneSelect={(boneName) => {
                                setSelectedBoneName(boneName);
                                setEditTarget('bone');
                                if (transformMode === 'scale') setTransformMode('rotate');
                            }}
                        />
                    </div>
                    {/* FK chain hint when in bone mode */}
                    {editTarget === 'bone' && (
                        <div style={{
                            position: 'absolute', bottom: 16, left: 0, right: 0,
                            display: 'flex', justifyContent: 'center', pointerEvents: 'none',
                        }}>
                            <div style={{
                                padding: '7px 16px',
                                borderRadius: 999,
                                background: 'rgba(6,10,8,0.85)',
                                border: '1px solid rgba(0,229,204,0.3)',
                                color: '#9de8e0',
                                fontSize: 11,
                                letterSpacing: '0.12em',
                                fontWeight: 700,
                            }}>
                                🔄 FK Chain — дочерние кости следуют за родительскими автоматически
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 16, maxHeight: 'calc(100vh - 160px)' }}>

                    <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#080a09', flexShrink: 0 }}>
                        <div style={{
                            flex: 1, padding: '11px 16px',
                            background: 'linear-gradient(135deg,rgba(57,255,20,0.1) 0%,rgba(14,44,24,0.4) 100%)',
                            color: '#d9ffe0', fontWeight: 800, fontSize: 12, letterSpacing: '0.06em',
                            textAlign: 'center'
                        }}>🎽 Garments & Poses</div>
                    </div>

                    <div style={{ display: 'grid', gap: 16, alignContent: 'start', overflow: 'auto', paddingRight: 4 }}>

                    {error ? (
                        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,99,99,0.12)', border: '1px solid rgba(255,99,99,0.2)', color: '#ffc1c1', fontSize: 13 }}>
                            {error}
                        </div>
                    ) : null}

                    {notice ? (
                        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(125,255,143,0.12)', border: '1px solid rgba(125,255,143,0.2)', color: '#d9ffe1', fontSize: 13 }}>
                            {notice}
                        </div>
                    ) : null}


                    {/* ── GARMENTS & POSES PANEL (original content) ────── */}
                    {true && <>
                        <section style={sectionStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div>
                                <div style={labelStyle}>Selected Garment</div>
                                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{selectedGarment.name}</div>
                            </div>
                            <div style={{ padding: '8px 10px', borderRadius: 999, background: 'rgba(125,255,143,0.12)', color: '#d7ffe2', fontSize: 12, fontWeight: 700 }}>
                                {categoryLabels[selectedGarment.category]}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: 10 }}>
                            {Object.entries(groupedGarments).map(([category, garments]) => (
                                <div key={category} style={{ display: 'grid', gap: 8 }}>
                                    <div style={labelStyle}>{categoryLabels[category] ?? category}</div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {garments.map((garment) => {
                                            const isActive = selectedGarmentId === garment.id;
                                            const isConfigured = Boolean(ensureSceneStore.garments[garment.id]);
                                            const isFeatured = ensureSceneStore.featuredGarmentId === garment.id;

                                            return (
                                                <button
                                                    key={garment.id}
                                                    onClick={() => setSelectedGarmentId(garment.id)}
                                                    style={{
                                                        ...actionButton(isActive),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                    }}
                                                >
                                                    <span>{garment.name}</span>
                                                    {isConfigured ? <span style={{ fontSize: 10, color: '#97d3a1' }}>preset</span> : null}
                                                    {isFeatured ? <span style={{ fontSize: 10, color: '#ffe58a' }}>default</span> : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={sectionStyle}>
                        <div style={labelStyle}>Editor Mode</div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button onClick={() => setEditTarget('garment')} style={actionButton(editTarget === 'garment')}>Garment Gizmo</button>
                            <button onClick={() => setEditTarget('bone')} style={actionButton(editTarget === 'bone')}>Bone Gizmo (FK)</button>
                            <button onClick={() => setShowSkeleton((current) => !current)} style={actionButton(showSkeleton)}>Skeleton</button>
                        </div>

                        {/* Style3D-like auto-skin toggle */}
                        <button
                            onClick={() => setAutoSkin(v => !v)}
                            style={{
                                ...actionButton(autoSkin),
                                width: '100%',
                                border: autoSkin
                                    ? '1px solid rgba(0,229,204,0.55)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                background: autoSkin
                                    ? 'linear-gradient(135deg,rgba(0,229,204,0.18) 0%,rgba(0,80,70,0.6) 100%)'
                                    : 'rgba(255,255,255,0.04)',
                                color: autoSkin ? '#9de8e0' : '#8a9f92',
                                padding: '12px 16px',
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}
                        >
                            <span style={{ fontSize: 18 }}>🧵</span>
                            <span>
                                <strong style={{ display: 'block', fontSize: 13 }}>
                                    Style3D Skinning {autoSkin ? 'ON' : 'OFF'}
                                </strong>
                                <span style={{ fontSize: 11, opacity: 0.75 }}>
                                    {autoSkin
                                        ? 'Одежда деформируется вместе с костями'
                                        : 'Одежда статичная (нет деформации)'}
                                </span>
                            </span>
                        </button>

                        {editTarget === 'garment' && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button onClick={() => setTransformMode('translate')} style={actionButton(transformMode === 'translate')}>Translate</button>
                                <button onClick={() => setTransformMode('rotate')} style={actionButton(transformMode === 'rotate')}>Rotate</button>
                                <button onClick={() => setTransformMode('scale')} style={actionButton(transformMode === 'scale')}>Scale</button>
                            </div>
                        )}

                        {editTarget === 'bone' && (
                            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,229,204,0.08)', border: '1px solid rgba(0,229,204,0.2)', fontSize: 12, color: '#9de8e0', lineHeight: 1.7 }}>
                                🦴 <strong>FK Chain Mode</strong> — вращение кости автоматически переносит все дочерние кости (как в Blender / ARP).
                                {autoSkin && <> Одежда <strong>деформируется вместе с костями</strong> (Style3D режим).</>}
                                {' '}Кликните по светящемуся суставу чтобы выбрать кость.
                            </div>
                        )}
                    </section>

                    <section style={sectionStyle}>
                        <div style={labelStyle}>Garment Transform</div>
                        <VectorInputs
                            label="Position"
                            value={selectedPreset.garmentTransform.position}
                            step={0.01}
                            onChange={(position) => handleGarmentTransformChange({ ...selectedPreset.garmentTransform, position })}
                        />
                        <RotationInputs
                            label="Rotation (deg)"
                            value={selectedPreset.garmentTransform.rotation}
                            onChange={(rotation) => handleGarmentTransformChange({ ...selectedPreset.garmentTransform, rotation })}
                        />
                        <VectorInputs
                            label="Scale"
                            value={selectedPreset.garmentTransform.scale}
                            step={0.05}
                            onChange={(scale) => handleGarmentTransformChange({ ...selectedPreset.garmentTransform, scale })}
                        />

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handleGarmentTransformChange(createDefaultMaleGarmentPreset(selectedGarment).garmentTransform)}
                                style={actionButton(false)}
                            >
                                Reset Garment Transform
                            </button>
                        </div>
                    </section>

                    <section style={sectionStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div>
                                <div style={labelStyle}>Avatar Bone Pose</div>
                                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 700 }}>{selectedBoneName ?? 'Choose a bone'}</div>
                            </div>
                            <button onClick={() => setEditTarget('bone')} style={actionButton(editTarget === 'bone')}>
                                Edit Bone
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: 10 }}>
                            {MALE_BONE_GROUPS.map((group) => (
                                <div key={group.id} style={{ display: 'grid', gap: 8 }}>
                                    <div style={labelStyle}>{group.label}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {group.bones
                                            .filter((boneName) => availableBones.includes(boneName))
                                            .map((boneName) => {
                                                const isActive = selectedBoneName === boneName;
                                                return (
                                                    <button
                                                        key={boneName}
                                                        className={`ams-bone-btn${isActive ? ' ams-bone-btn-active' : ''}`}
                                                        onClick={() => {
                                                            setSelectedBoneName(boneName);
                                                            setEditTarget('bone');
                                                            if (transformMode === 'scale') setTransformMode('rotate');
                                                        }}
                                                        style={{
                                                            ...actionButton(isActive),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 6,
                                                        }}
                                                    >
                                                        <span style={{
                                                            display: 'inline-block',
                                                            width: 8, height: 8,
                                                            borderRadius: '50%',
                                                            background: isActive ? '#7dff8f' : 'rgba(125,255,143,0.3)',
                                                            flexShrink: 0,
                                                            transition: 'background 0.2s',
                                                        }} />
                                                        {boneName}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedBoneName && selectedBonePose ? (
                            <>
                                <VectorInputs
                                    label="Bone Position"
                                    value={selectedBonePose.position}
                                    step={0.01}
                                    onChange={(position) => handleBoneTransformChange(selectedBoneName, { ...selectedBonePose, position })}
                                />
                                <RotationInputs
                                    label="Bone Rotation (deg)"
                                    value={selectedBonePose.rotation}
                                    onChange={(rotation) => handleBoneTransformChange(selectedBoneName, { ...selectedBonePose, rotation })}
                                />
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => {
                                            mutateSelectedPreset((preset) => {
                                                const nextBones = { ...preset.avatarPose.bones };
                                                delete nextBones[selectedBoneName];

                                                return {
                                                    ...preset,
                                                    avatarPose: { bones: nextBones },
                                                };
                                            });
                                        }}
                                        style={actionButton(false)}
                                    >
                                        Reset Selected Bone
                                    </button>
                                    <button
                                        onClick={() => {
                                            mutateSelectedPreset((preset) => ({
                                                ...preset,
                                                avatarPose: { bones: {} },
                                            }));
                                        }}
                                        style={actionButton(false)}
                                    >
                                        Reset Garment Pose
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </section>
                    </>} {/* end garments tab */}
                    </div> {/* end scroll container */}
                </div>
            </div>
        </div>
    );
}
