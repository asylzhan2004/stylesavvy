import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTouchGesture } from '../hooks/useTouchGesture';
import { FONTS } from '../constants';
import type { DesignEl } from '../types';

interface TouchElementControlsProps {
    el: DesignEl;
    onUpdate: (id: string, u: Partial<DesignEl>) => void;
    onDelete: (id: string) => void;
    onDeselect: () => void;
    isMoving: boolean;
    setIsMoving: (v: boolean) => void;
}

/**
 * Mobile floating controls shown above a selected design element.
 * Provides touch-friendly drag, scale, rotate, and quick-action buttons.
 */
export function TouchElementControls({ el, onUpdate, onDelete, onDeselect, isMoving, setIsMoving }: TouchElementControlsProps) {
    const [activeControl, setActiveControl] = useState<'move' | 'scale' | 'rotate' | null>(null);

    // ── Move handler ──
    const { onTouchStart: moveStart, onTouchMove: moveMove, onTouchEnd: moveEnd } = useTouchGesture({
        onMove: (dx, dy) => {
            // Scale screen pixels to UV canvas coords
            // Panel is ~330px wide, design canvas is CW=460, CH=580
            const SCALE_X = 1.2;
            const SCALE_Y = 1.2;
            onUpdate(el.id, { x: el.x + dx * SCALE_X, y: el.y + dy * SCALE_Y });
        },
    });

    // ── Scale handler ──
    const { onTouchStart: scaleStart, onTouchMove: scaleMove, onTouchEnd: scaleEnd } = useTouchGesture({
        onScale: (delta) => {
            const newW = Math.max(20, el.w + el.w * delta * 2);
            const newH = Math.max(20, el.h + el.h * delta * 2);
            const newFontSize = el.type === 'text' ? Math.max(8, Math.round(el.fontSize * (1 + delta * 2))) : el.fontSize;
            onUpdate(el.id, { w: newW, h: newH, fontSize: newFontSize });
        },
        onMove: (dx) => {
            // Single finger fallback: horizontal slide = scale
            const delta = dx * 0.004;
            const newW = Math.max(20, el.w + el.w * delta);
            const newH = Math.max(20, el.h + el.h * delta);
            const newFontSize = el.type === 'text' ? Math.max(8, Math.round(el.fontSize * (1 + delta))) : el.fontSize;
            onUpdate(el.id, { w: newW, h: newH, fontSize: newFontSize });
        },
    });

    // ── Rotate handler ──
    const { onTouchStart: rotStart, onTouchMove: rotMove, onTouchEnd: rotEnd } = useTouchGesture({
        onRotate: (angleDelta) => {
            onUpdate(el.id, { rotation: ((el.rotation + angleDelta) % 360 + 360) % 360 });
        },
        onMove: (dx) => {
            // Single finger fallback: slide = rotate
            onUpdate(el.id, { rotation: ((el.rotation + dx * 0.5) % 360 + 360) % 360 });
        },
    });

    const btnStyle = (active: boolean, color = '#22c55e'): React.CSSProperties => ({
        flex: 1,
        padding: '10px 4px',
        borderRadius: 10,
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
        background: active ? `${color}18` : 'rgba(255,255,255,0.04)',
        color: active ? color : '#94a3b8',
        fontSize: 10,
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        transition: 'all 0.18s',
        userSelect: 'none',
        touchAction: 'none',
    });

    const padStyle: React.CSSProperties = {
        width: '100%',
        height: 80,
        borderRadius: 14,
        border: '2px dashed rgba(34,197,94,0.3)',
        background: 'rgba(34,197,94,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
        fontSize: 12,
        color: '#64748b',
        marginTop: 10,
        position: 'relative',
        overflow: 'hidden',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ marginBottom: 16, padding: 14, borderRadius: 18, border: '1.5px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.04)' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {el.type === 'text' ? '✏️ Текст' : '🖼️ Фото'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button
                        onClick={() => onDelete(el.id)}
                        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >🗑️</button>
                    <button
                        onClick={onDeselect}
                        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >✕</button>
                </div>
            </div>

            {/* Mode selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                <button onClick={() => setActiveControl(activeControl === 'move' ? null : 'move')} style={btnStyle(activeControl === 'move')}>
                    <span style={{ fontSize: 16 }}>✋</span>
                    <span>Двигать</span>
                </button>
                <button onClick={() => setActiveControl(activeControl === 'scale' ? null : 'scale')} style={btnStyle(activeControl === 'scale', '#3b82f6')}>
                    <span style={{ fontSize: 16 }}>⤡</span>
                    <span>Размер</span>
                </button>
                <button onClick={() => { setActiveControl(activeControl === 'rotate' ? null : 'rotate'); setIsMoving(false); }} style={btnStyle(activeControl === 'rotate', '#a855f7')}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span>Поворот</span>
                </button>
                <button onClick={() => { setIsMoving(!isMoving); setActiveControl(null); }} style={btnStyle(isMoving, '#f59e0b')}>
                    <span style={{ fontSize: 16 }}>📍</span>
                    <span>Клик-перенос</span>
                </button>
            </div>

            {/* Touch pads */}
            <AnimatePresence mode="wait">
                {activeControl === 'move' && (
                    <motion.div key="move" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div
                            style={padStyle}
                            onTouchStart={moveStart} onTouchMove={moveMove} onTouchEnd={moveEnd}
                        >
                            <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                                <div style={{ fontSize: 22, marginBottom: 4 }}>✋</div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>Проведите пальцем для перемещения</div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {activeControl === 'scale' && (
                    <motion.div key="scale" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        {/* Numeric controls for better UX */}
                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 9, color: '#64748b', width: 32, textTransform: 'uppercase', fontWeight: 700 }}>
                                    {el.type === 'text' ? 'Размер' : 'Ширина'}
                                </span>
                                <button onClick={() => {
                                    const delta = -0.1;
                                    onUpdate(el.id, { w: Math.max(20, el.w * (1 + delta)), h: Math.max(20, el.h * (1 + delta)), fontSize: Math.max(8, Math.round(el.fontSize * (1 + delta))) });
                                }} style={{ ...scaleButtonStyle }}>−</button>
                                <input type="range" min={20} max={800} value={el.w}
                                    onChange={e => onUpdate(el.id, { w: +e.target.value, h: el.h / el.w * +e.target.value })}
                                    style={{ flex: 1, accentColor: '#3b82f6' }} />
                                <button onClick={() => {
                                    const delta = 0.1;
                                    onUpdate(el.id, { w: Math.min(800, el.w * (1 + delta)), h: Math.min(800, el.h * (1 + delta)), fontSize: Math.max(8, Math.round(el.fontSize * (1 + delta))) });
                                }} style={{ ...scaleButtonStyle }}>+</button>
                                <span style={{ fontSize: 10, color: '#94a3b8', width: 36, textAlign: 'right' }}>{Math.round(el.w)}px</span>
                            </div>
                            <div
                                style={{ ...padStyle, borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' }}
                                onTouchStart={scaleStart} onTouchMove={scaleMove} onTouchEnd={scaleEnd}
                            >
                                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                                    <div style={{ fontSize: 22, marginBottom: 4 }}>🤏</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Пинч двумя пальцами или слайд для масштаба</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {activeControl === 'rotate' && (
                    <motion.div key="rotate" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 9, color: '#64748b', width: 32, textTransform: 'uppercase', fontWeight: 700 }}>Угол</span>
                                <button onClick={() => onUpdate(el.id, { rotation: ((el.rotation - 15) % 360 + 360) % 360 })} style={{ ...scaleButtonStyle }}>−15°</button>
                                <input type="range" min={-180} max={180} value={el.rotation}
                                    onChange={e => onUpdate(el.id, { rotation: +e.target.value })}
                                    style={{ flex: 1, accentColor: '#a855f7' }} />
                                <button onClick={() => onUpdate(el.id, { rotation: ((el.rotation + 15) % 360 + 360) % 360 })} style={{ ...scaleButtonStyle }}>+15°</button>
                                <span style={{ fontSize: 10, color: '#94a3b8', width: 36, textAlign: 'right' }}>{Math.round(el.rotation)}°</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                                {[0, 90, 180, 270].map(deg => (
                                    <button key={deg} onClick={() => onUpdate(el.id, { rotation: deg })}
                                        style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: `1px solid ${el.rotation === deg ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)'}`, background: el.rotation === deg ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)', color: el.rotation === deg ? '#a855f7' : '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                                        {deg}°
                                    </button>
                                ))}
                            </div>
                            <div
                                style={{ ...padStyle, borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.05)' }}
                                onTouchStart={rotStart} onTouchMove={rotMove} onTouchEnd={rotEnd}
                            >
                                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                                    <div style={{ fontSize: 22, marginBottom: 4 }}>🔄</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Проведите пальцем или крутите двумя пальцами</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick presets */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button onClick={() => onUpdate(el.id, { x: 230, y: 290 })}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#64748b', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
                    ⊕ Центр
                </button>
                <button onClick={() => onUpdate(el.id, { rotation: 0 })}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#64748b', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
                    ↺ Сброс угла
                </button>
                <button onClick={() => onUpdate(el.id, { w: 200, h: Math.round(200 * (el.h / el.w)) })}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#64748b', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
                    ⊡ Сброс размера
                </button>
            </div>

            {/* Text specific settings: Content and Font (Mobile version) */}
            {el.type === 'text' && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 800, marginBottom: 8, letterSpacing: '0.05em' }}>Настройка текста</div>
                    
                    <textarea 
                        value={el.content} 
                        onChange={e => onUpdate(el.id, { content: e.target.value })}
                        placeholder="Введите текст..."
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, background: 'rgba(0,0,0,0.3)', color: '#fff', outline: 'none', resize: 'none', minHeight: 44, marginBottom: 10, fontFamily: el.fontFamily }} 
                    />

                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                        {FONTS.slice(0, 8).map(f => (
                            <button 
                                key={f} 
                                onClick={() => onUpdate(el.id, { fontFamily: f })}
                                style={{ 
                                    padding: '6px 12px', borderRadius: 8, border: `1px solid ${el.fontFamily === f ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, 
                                    background: el.fontFamily === f ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', 
                                    color: el.fontFamily === f ? '#22c55e' : '#94a3b8', fontSize: 10, whiteSpace: 'nowrap', fontFamily: f 
                                }}
                            >
                                Abc
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                        <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Цвет</span>
                        <div style={{ position: 'relative', width: 34, height: 34, borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ position: 'absolute', inset: 0, background: el.color }} />
                            <input type="color" value={el.color} onChange={e => onUpdate(el.id, { color: e.target.value })}
                                style={{ position: 'absolute', inset: -4, width: 44, height: 44, cursor: 'pointer', border: 'none', opacity: 0 }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', flex: 1 }}>{el.color.toUpperCase()}</span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Градиент</span>
                            <div onClick={() => onUpdate(el.id, { gradientEnabled: !el.gradientEnabled })}
                                style={{ width: 34, height: 18, borderRadius: 10, background: el.gradientEnabled ? '#22c55e' : 'rgba(255,255,255,0.08)', cursor: 'pointer', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 3, left: el.gradientEnabled ? 18 : 3, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: '0.2s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

const scaleButtonStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
};
