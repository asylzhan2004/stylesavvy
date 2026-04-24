import React from 'react';
import type { DesignEl, Decal3D, PaintLayer } from '../types';

interface LayersPanelProps {
    els: DesignEl[];
    decals: Decal3D[];
    paintLayers: PaintLayer[];
    selId: string | null;
    selDecalId: string | null;
    selPaintId: string | null;
    setSelId: (id: string | null) => void;
    setSelDecalId: (id: string | null) => void;
    setSelPaintId: (id: string | null) => void;
    setDecals: React.Dispatch<React.SetStateAction<Decal3D[]>>;
    setPaintLayers: React.Dispatch<React.SetStateAction<PaintLayer[]>>;
}

export function LayersPanel({
    els, decals, paintLayers,
    selId, selDecalId, selPaintId,
    setSelId, setSelDecalId, setSelPaintId,
    setDecals, setPaintLayers,
}: LayersPanelProps) {
    const total = els.length + decals.length + paintLayers.length;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    return (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#444', textTransform: 'uppercase' }}>
                    Layers ({total})
                </div>
                {isMobile && total > 0 && (
                    <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>
                        👆 Нажми для управления
                    </div>
                )}
            </div>

            {/* Mobile hint when only paint layers exist */}
            {isMobile && paintLayers.length > 0 && els.length === 0 && (
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 10, color: '#fbbf24', lineHeight: 1.6 }}>
                    💡 <b>Совет:</b> Для полного управления (перемещение, размер, поворот) используй кнопку <b>"✏️ Текст"</b> → <b>"+ Add Text (Auto)"</b> вместо "As Paint".
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {els.map(el => {
                    const isSelected = selId === el.id;
                    return (
                        <div key={el.id}
                            onClick={() => { setSelId(el.id); setSelDecalId(null); setSelPaintId(null); }}
                            style={{
                                padding: '10px 12px', background: isSelected ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
                                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                                border: `1px solid ${isSelected ? 'rgba(34,197,94,0.5)' : 'transparent'}`,
                                boxShadow: isSelected ? '0 0 12px rgba(34,197,94,0.2)' : 'none',
                                transition: 'all 0.2s',
                            }}>
                            <span style={{ fontSize: 16 }}>{el.type === 'text' ? '✏️' : '🖼️'}</span>
                            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: isSelected ? '#22c55e' : '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {el.type === 'text' ? el.content : '2D Image'}
                            </span>
                            {isSelected && isMobile && (
                                <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 800, whiteSpace: 'nowrap' }}>✓ ВЫБРАН</span>
                            )}
                            {!isSelected && isMobile && (
                                <span style={{ fontSize: 9, color: '#64748b' }}>▶</span>
                            )}
                        </div>
                    );
                })}

                {paintLayers.map(layer => {
                    const isSelected = selPaintId === layer.id;
                    return (
                        <div key={layer.id}
                            onClick={() => { setSelPaintId(layer.id); setSelId(null); setSelDecalId(null); }}
                            style={{
                                padding: '10px 12px', background: isSelected ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.06)',
                                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
                                border: `1px solid ${isSelected ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.16)'}`,
                                boxShadow: isSelected ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                            <span style={{ fontSize: 16 }}>{layer.type === 'text' ? '✏️' : '🖌️'}</span>
                            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#93c5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{layer.label}</span>
                            {isSelected && isMobile && (
                                <span style={{ fontSize: 9, color: '#93c5fd', fontWeight: 800, whiteSpace: 'nowrap' }}>✓ ВЫБРАН</span>
                            )}
                            <button onClick={e => { e.stopPropagation(); setPaintLayers(p => p.filter(x => x.id !== layer.id)); if (selPaintId === layer.id) setSelPaintId(null); }}
                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, padding: 4, fontSize: 14 }}>✕</button>
                        </div>
                    );
                })}

                {decals.map(d => {
                    const isSelected = selDecalId === d.id;
                    return (
                        <div key={d.id}
                            onClick={() => { setSelDecalId(d.id); setSelId(null); setSelPaintId(null); }}
                            style={{
                                padding: '10px 12px', background: isSelected ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.04)',
                                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
                                border: `1px solid ${isSelected ? 'rgba(34,197,94,0.45)' : 'rgba(34,197,94,0.1)'}`,
                                boxShadow: isSelected ? '0 0 12px rgba(34,197,94,0.15)' : 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                            <span style={{ fontSize: 16 }}>📌</span>
                            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#22c55e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>3D Decal</span>
                            <button onClick={e => { e.stopPropagation(); setDecals(p => p.filter(x => x.id !== d.id)); if (selDecalId === d.id) setSelDecalId(null); }}
                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, padding: 4, fontSize: 14 }}>✕</button>
                        </div>
                    );
                })}

                {total === 0 && (
                    <div style={{ fontSize: 11, color: '#444', textAlign: 'center', padding: 20 }}>
                        {isMobile ? '📭 Нет элементов. Добавь текст или фото выше.' : 'No elements yet'}
                    </div>
                )}
            </div>
        </div>
    );
}
