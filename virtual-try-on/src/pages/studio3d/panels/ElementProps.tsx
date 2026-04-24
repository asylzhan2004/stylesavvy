import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONTS } from '../constants';
import type { DesignEl, Decal3D, PaintLayer } from '../types';
import { szBtn } from '../styles';
import { TouchElementControls } from './TouchElementControls';

interface ElementPropsProps {
    selId: string | null;
    selDecalId: string | null;
    selPaintId: string | null;
    els: DesignEl[];
    decals: Decal3D[];
    paintLayers: PaintLayer[];
    upd: (id: string, u: Partial<DesignEl>) => void;
    del: (id: string) => void;
    setSelId: (id: string | null) => void;
    setDecals: React.Dispatch<React.SetStateAction<Decal3D[]>>;
    setPaintLayers: React.Dispatch<React.SetStateAction<PaintLayer[]>>;
    setSelDecalId: (id: string | null) => void;
    setSelPaintId: (id: string | null) => void;
    isMovingElement: boolean;
    setIsMovingElement: (v: boolean) => void;
    isMovingPaint: boolean;
    setIsMovingPaint: (v: boolean) => void;
}

export function ElementProps({
    selId, selDecalId, selPaintId,
    els, decals, paintLayers,
    upd, del, setSelId,
    setDecals, setPaintLayers,
    setSelDecalId, setSelPaintId,
    isMovingElement, setIsMovingElement,
    isMovingPaint, setIsMovingPaint,
}: ElementPropsProps) {
    const sel = selId ? els.find(e => e.id === selId) : null;
    const selDecal = selDecalId ? decals.find(d => d.id === selDecalId) : null;
    const selPaint = selPaintId ? paintLayers.find(l => l.id === selPaintId) : null;

    // Mobile: properly detect via hook (not one-time matchMedia call)
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' && window.innerWidth <= 768
    );
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (!sel && !selDecal && !selPaint) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ marginBottom: 16 }}
            >

                {/* ── 2D Element ── */}
                {sel && (
                    isMobile ? (
                        // Mobile: full touch gesture controls
                        <TouchElementControls
                            el={sel}
                            onUpdate={upd}
                            onDelete={del}
                            onDeselect={() => setSelId(null)}
                            isMoving={isMovingElement}
                            setIsMoving={setIsMovingElement}
                        />
                    ) : (
                        // Desktop: classic panel
                        <div style={{ padding: 16, background: 'rgba(34,197,94,0.04)', borderRadius: 16, border: '1px solid rgba(34,197,94,0.15)' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase' }}>
                                    {sel.type === 'text' ? '✏️ Text' : '🖼️ Image'}
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => del(sel.id)}
                                        style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                        🗑️
                                    </button>
                                    <button onClick={() => setSelId(null)}
                                        style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {sel.type === 'text' && (
                                <>
                                    <textarea value={sel.content} onChange={e => upd(sel.id, { content: e.target.value })}
                                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, outline: 'none', resize: 'vertical', minHeight: 48, background: 'rgba(0,0,0,0.2)', color: '#f1f5f9', fontFamily: 'inherit', marginBottom: 10 }} />
                                    <select value={sel.fontFamily} onChange={e => upd(sel.id, { fontFamily: e.target.value })}
                                        style={{ width: '100%', marginBottom: 10, padding: '6px 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'rgba(0,0,0,0.2)', color: '#e2e8f0', fontSize: 11, outline: 'none', cursor: 'pointer' }}>
                                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>

                                    {/* Font size */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <span style={{ fontSize: 9, color: '#64748b', width: 36, textTransform: 'uppercase', fontWeight: 700 }}>Size</span>
                                        <button onClick={() => upd(sel.id, { fontSize: Math.max(8, sel.fontSize - 2) })} style={szBtn}>−</button>
                                        <input type="range" min={8} max={120} value={sel.fontSize} onChange={e => upd(sel.id, { fontSize: +e.target.value })} style={{ flex: 1, accentColor: '#22c55e' }} />
                                        <button onClick={() => upd(sel.id, { fontSize: Math.min(120, sel.fontSize + 2) })} style={szBtn}>+</button>
                                        <span style={{ fontSize: 10, color: '#94a3b8', width: 30, textAlign: 'right' }}>{sel.fontSize}px</span>
                                    </div>

                                    {/* Color */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <span style={{ fontSize: 9, color: '#64748b', width: 36, textTransform: 'uppercase', fontWeight: 700 }}>Color</span>
                                        <div style={{ position: 'relative', width: 28, height: 28, borderRadius: 7, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                                            <div style={{ position: 'absolute', inset: 0, background: sel.color }} />
                                            <input type="color" value={sel.color} onChange={e => upd(sel.id, { color: e.target.value })}
                                                style={{ position: 'absolute', inset: -4, width: 36, height: 36, cursor: 'pointer', border: 'none', opacity: 0 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{sel.color}</span>
                                    </div>

                                    {/* Gradient toggle */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sel.gradientEnabled ? 10 : 0 }}>
                                        <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Gradient</span>
                                        <div onClick={() => upd(sel.id, { gradientEnabled: !sel.gradientEnabled })}
                                            style={{ width: 34, height: 18, borderRadius: 10, background: sel.gradientEnabled ? '#22c55e' : 'rgba(255,255,255,0.08)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                            <div style={{ position: 'absolute', top: 3, left: sel.gradientEnabled ? 18 : 3, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                                        </div>
                                        {sel.gradientEnabled && (
                                            <div style={{ position: 'relative', width: 24, height: 24, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                                                <div style={{ position: 'absolute', inset: 0, background: sel.gradientColor2 || '#000' }} />
                                                <input type="color" value={sel.gradientColor2 || '#000000'} onChange={e => upd(sel.id, { gradientColor2: e.target.value })}
                                                    style={{ position: 'absolute', inset: -4, width: 32, height: 32, cursor: 'pointer', border: 'none', opacity: 0 }} />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Rotation (both types) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 9, color: '#64748b', width: 36, textTransform: 'uppercase', fontWeight: 700 }}>Rot</span>
                                <input type="range" min={-180} max={180} value={sel.rotation} onChange={e => upd(sel.id, { rotation: +e.target.value })} style={{ flex: 1, accentColor: '#22c55e' }} />
                                <span style={{ fontSize: 10, color: '#94a3b8', width: 36, textAlign: 'right' }}>{sel.rotation}°</span>
                                <button onClick={() => upd(sel.id, { rotation: 0 })}
                                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 10, cursor: 'pointer' }}>↺</button>
                            </div>
                        </div>
                    )
                )}

                {/* ── 3D Decal ── */}
                {selDecal && !sel && (
                    <div style={{ padding: 16, background: 'rgba(34,197,94,0.04)', borderRadius: 16, border: '1px solid rgba(34,197,94,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase' }}>📌 3D Decal</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => { setDecals(p => p.filter(d => d.id !== selDecal.id)); setSelDecalId(null); }}
                                    style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                    🗑️ Удалить
                                </button>
                                <button onClick={() => setSelDecalId(null)}
                                    style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 10 }}>
                            {isMobile
                                ? '👆 Нажмите и удерживайте на 3D-модели чтобы переместить декаль'
                                : 'Перетащите декаль на 3D-модели для смены позиции'}
                            <br />
                            <span style={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}>
                                ({selDecal.position.x.toFixed(2)}, {selDecal.position.y.toFixed(2)}, {selDecal.position.z.toFixed(2)})
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Paint Layer ── */}
                {selPaint && !sel && !selDecal && (
                    <div style={{ padding: 16, background: 'rgba(147,197,253,0.04)', borderRadius: 16, border: '1px solid rgba(147,197,253,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase' }}>
                                {selPaint.type === 'text' ? '✏️ Text Paint' : '🖼️ Image Paint'}
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => { setPaintLayers(p => p.filter(l => l.id !== selPaint.id)); setSelPaintId(null); }}
                                    style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                    🗑️
                                </button>
                                <button onClick={() => setSelPaintId(null)}
                                    style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        {isMobile ? (
                            // Mobile: move-by-click button
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Big Move Button */}
                                <button
                                    onClick={() => setIsMovingPaint(!isMovingPaint)}
                                    style={{
                                        width: '100%', padding: '14px 10px', borderRadius: 14,
                                        border: `2px solid ${isMovingPaint ? '#3b82f6' : 'rgba(147,197,253,0.3)'}`,
                                        background: isMovingPaint ? 'rgba(59,130,246,0.2)' : 'rgba(147,197,253,0.06)',
                                        color: isMovingPaint ? '#93c5fd' : '#64748b',
                                        fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: isMovingPaint ? '0 0 16px rgba(59,130,246,0.3)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span style={{ fontSize: 20 }}>📍</span>
                                    {isMovingPaint
                                        ? 'Отменить перемещение'
                                        : 'Нажми здесь для перемещения'}
                                </button>

                                {isMovingPaint && (
                                    <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', fontSize: 11, color: '#93c5fd', textAlign: 'center', lineHeight: 1.7 }}>
                                        👆 Сверните панель и нажмите на <b>любое место</b> на 3D-модели<br />
                                        <span style={{ fontSize: 9, opacity: 0.7, marginTop: 4, display: 'block' }}>Слой переместится туда</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 6 }}>
                                    <div style={{ flex: 1, padding: '8px 6px', borderRadius: 10, background: 'rgba(147,197,253,0.06)', border: '1px solid rgba(147,197,253,0.15)', fontSize: 10, color: '#64748b', textAlign: 'center' }}>
                                        UV ({selPaint.u.toFixed(2)}, {selPaint.v.toFixed(2)})
                                    </div>
                                    <div style={{ flex: 1, padding: '8px 6px', borderRadius: 10, background: 'rgba(147,197,253,0.06)', border: '1px solid rgba(147,197,253,0.15)', fontSize: 10, color: '#64748b', textAlign: 'center' }}>
                                        {selPaint.type === 'text' ? '✏️ Текст' : '🖼️ Фото'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 10 }}>
                                <b style={{ color: '#93c5fd' }}>{selPaint.label}</b><br />
                                Часть: <span style={{ color: '#94a3b8' }}>{selPaint.partName}</span><br />
                                UV: <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>({selPaint.u.toFixed(3)}, {selPaint.v.toFixed(3)})</span>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
