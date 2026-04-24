import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminSceneAPI } from '../api/client';
import { MaleSceneCanvas } from '../components/maleScene/MaleSceneCanvas';
import {
    createDefaultMaleGarmentPreset,
    findMaleGarmentById,
    MALE_GARMENTS,
    type MaleSceneStore,
} from '../features/maleScene/config';

const shellStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, rgba(24,74,41,0.2) 0%, rgba(4,7,5,1) 50%)',
    color: '#f3fff5',
};

const cardStyle: React.CSSProperties = {
    background: 'rgba(7,10,8,0.88)',
    border: '1px solid rgba(125,255,143,0.12)',
    borderRadius: 20,
    boxShadow: '0 30px 70px rgba(0,0,0,0.32)',
};

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

export function MenShowroom() {
    const [sceneStore, setSceneStore] = useState<MaleSceneStore | null>(null);
    const [selectedGarmentId, setSelectedGarmentId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const store = await adminSceneAPI.getMenScene();

                if (cancelled) {
                    return;
                }

                setSceneStore(store);
                setSelectedGarmentId(store.featuredGarmentId ?? MALE_GARMENTS[0]?.id ?? '');
                setError('');
            } catch (loadError: any) {
                if (cancelled) {
                    return;
                }

                setError(loadError?.response?.data?.error || 'Unable to load the men showroom scene.');
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const selectedGarment =
        findMaleGarmentById(selectedGarmentId) ??
        findMaleGarmentById(sceneStore?.featuredGarmentId) ??
        MALE_GARMENTS[0] ??
        null;

    const selectedPreset = useMemo(() => {
        if (!selectedGarment) {
            return null;
        }

        return sceneStore?.garments[selectedGarment.id] ?? createDefaultMaleGarmentPreset(selectedGarment);
    }, [sceneStore, selectedGarment]);

    if (loading) {
        return (
            <div style={{ ...shellStyle, display: 'grid', placeItems: 'center' }}>
                <div style={{ ...cardStyle, padding: 24, textAlign: 'center', minWidth: 260 }}>
                    <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#97d3a1', fontWeight: 800 }}>
                        Loading Men Showroom
                    </div>
                </div>
            </div>
        );
    }

    if (error || !selectedGarment || !selectedPreset) {
        return (
            <div style={{ ...shellStyle, display: 'grid', placeItems: 'center', padding: 24 }}>
                <div style={{ ...cardStyle, padding: 24, width: 'min(520px, 100%)', display: 'grid', gap: 12 }}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Men Showroom</div>
                    <div style={{ color: '#9cb29f', lineHeight: 1.7 }}>{error || 'No male garments are available yet.'}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                                Back Home
                            </button>
                        </Link>
                        <Link to="/admin/men-scene" style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(125,255,143,0.2)', background: 'rgba(125,255,143,0.14)', color: '#e0ffe7', cursor: 'pointer', fontWeight: 700 }}>
                                Open Admin
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const configuredCount = Object.keys(sceneStore?.garments ?? {}).length;

    return (
        <div style={shellStyle}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#97d3a1', fontWeight: 800 }}>
                        User Showroom
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>Men Base Scene</div>
                    <div style={{ color: '#8ba48f', fontSize: 14 }}>
                        Default garment from admin: <strong style={{ color: '#f5fff7' }}>{findMaleGarmentById(sceneStore?.featuredGarmentId)?.name ?? 'Not pinned yet'}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                            Back Home
                        </button>
                    </Link>
                    <Link to="/admin/men-scene" style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(125,255,143,0.2)', background: 'rgba(125,255,143,0.14)', color: '#e0ffe7', cursor: 'pointer', fontWeight: 700 }}>
                            Admin Editor
                        </button>
                    </Link>
                </div>
            </div>

            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'minmax(420px, 1.4fr) minmax(340px, 1fr)', gap: 20 }}>
                <div style={{ ...cardStyle, overflow: 'hidden' }}>
                    <div style={{ height: 'calc(100vh - 170px)', minHeight: 620 }}>
                        <MaleSceneCanvas garmentUrl={selectedGarment.url} preset={selectedPreset} showSkeleton={false} />
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 16, alignContent: 'start', maxHeight: 'calc(100vh - 170px)', overflow: 'auto', paddingRight: 4 }}>
                    <section style={{ ...cardStyle, padding: 18, display: 'grid', gap: 12 }}>
                        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#97d3a1', fontWeight: 800 }}>
                            Current Garment
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{selectedGarment.name}</div>
                        <div style={{ color: '#8ca791', lineHeight: 1.7 }}>
                            The avatar pose and clothing transform come from the admin preset saved for this garment.
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(125,255,143,0.12)', color: '#d9ffe1', fontSize: 12, fontWeight: 700 }}>
                                {categoryLabels[selectedGarment.category]}
                            </div>
                            {sceneStore?.featuredGarmentId === selectedGarment.id ? (
                                <div style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,225,138,0.12)', color: '#ffe58a', fontSize: 12, fontWeight: 700 }}>
                                    Default For Users
                                </div>
                            ) : null}
                            {sceneStore?.garments[selectedGarment.id] ? (
                                <div style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(164,221,255,0.12)', color: '#bfe7ff', fontSize: 12, fontWeight: 700 }}>
                                    Saved Preset
                                </div>
                            ) : (
                                <div style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: '#d5ddd6', fontSize: 12, fontWeight: 700 }}>
                                    Base Pose
                                </div>
                            )}
                        </div>
                    </section>

                    <section style={{ ...cardStyle, padding: 18, display: 'grid', gap: 12 }}>
                        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#97d3a1', fontWeight: 800 }}>
                            Scene Overview
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ color: '#8fa591', fontSize: 12 }}>Male garments</div>
                                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>{MALE_GARMENTS.length}</div>
                            </div>
                            <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ color: '#8fa591', fontSize: 12 }}>Saved presets</div>
                                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>{configuredCount}</div>
                            </div>
                            <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ color: '#8fa591', fontSize: 12 }}>Featured</div>
                                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>{sceneStore?.featuredGarmentId ? '1' : '0'}</div>
                            </div>
                        </div>
                    </section>

                    <section style={{ ...cardStyle, padding: 18, display: 'grid', gap: 12 }}>
                        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#97d3a1', fontWeight: 800 }}>
                            Men Garments
                        </div>
                        {Object.entries(groupedGarments).map(([category, garments]) => (
                            <div key={category} style={{ display: 'grid', gap: 8 }}>
                                <div style={{ fontSize: 12, color: '#8ca792', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    {categoryLabels[category] ?? category}
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {garments.map((garment) => {
                                        const active = selectedGarmentId === garment.id;
                                        const isFeatured = sceneStore?.featuredGarmentId === garment.id;
                                        const isConfigured = Boolean(sceneStore?.garments[garment.id]);

                                        return (
                                            <button
                                                key={garment.id}
                                                onClick={() => setSelectedGarmentId(garment.id)}
                                                style={{
                                                    padding: '10px 12px',
                                                    borderRadius: 12,
                                                    border: active ? '1px solid rgba(125,255,143,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                                    background: active ? 'rgba(125,255,143,0.14)' : 'rgba(255,255,255,0.03)',
                                                    color: active ? '#effff2' : '#dce6dd',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: 13,
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
                    </section>
                </div>
            </div>
        </div>
    );
}
