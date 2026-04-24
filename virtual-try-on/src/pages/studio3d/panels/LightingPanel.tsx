import { motion, AnimatePresence } from 'framer-motion';
import type { LightConfig, LightType } from '../types';

interface LightingPanelProps {
    lights: LightConfig[];
    expandedLight: string | null;
    setExpandedLight: (id: string | null) => void;
    updLight: (id: string, u: Partial<LightConfig>) => void;
    delLight: (id: string) => void;
    addLight: () => void;
    resetLights: () => void;
}

export function LightingPanel({
    lights, expandedLight, setExpandedLight, updLight, delLight, addLight, resetLights,
}: LightingPanelProps) {
    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ padding: '10px 12px', display: 'flex', gap: 6, background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, backdropFilter: 'blur(5px)' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={addLight}
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', fontWeight: 800, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
                    ✚ Add Light
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={resetLights}
                    style={{ padding: '10px 15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, background: 'rgba(255,255,255,0.02)', color: '#cbd5e1', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', flexShrink: 0 }}>
                    ↺ Reset
                </motion.button>
            </div>

            {/* Light list */}
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Scene Infrastructure</div>

                {/* Ambient (fixed) */}
                <div style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#cce0ff', boxShadow: '0 0 10px rgba(204,224,255,0.4)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ambient Light</div>
                        <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>Global Illumination · 0.25</div>
                    </div>
                    <span style={{ fontSize: 14 }}>🌐</span>
                </div>

                <div style={{ fontSize: 9, fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 10, marginBottom: 4 }}>Dynamic Emitters</div>

                <AnimatePresence initial={false}>
                    {lights.map(l => {
                        const isExp = expandedLight === l.id;
                        const icon = l.type === 'directional' ? '☀️' : l.type === 'point' ? '💡' : '🔦';
                        return (
                            <motion.div key={l.id} layout
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    background: isExp ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: 12,
                                    border: `1px solid ${isExp ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.05)'}`,
                                    overflow: 'hidden',
                                    boxShadow: isExp ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
                                }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
                                    onClick={() => setExpandedLight(isExp ? null : l.id)}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, boxShadow: `0 0 8px ${l.color}88`, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12 }}>{icon}</span>
                                    <span style={{ flex: 1, fontSize: 11, fontWeight: 800, color: isExp ? '#22c55e' : '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{l.name}</span>
                                    {/* Toggle */}
                                    <div onClick={e => { e.stopPropagation(); updLight(l.id, { enabled: !l.enabled }); }}
                                        style={{ width: 34, height: 18, borderRadius: 10, background: l.enabled ? '#16a34a' : 'rgba(255,255,255,0.08)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'all 0.3s' }}>
                                        <div style={{ position: 'absolute', top: 3, left: l.enabled ? 19 : 3, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                                    </div>
                                </div>

                                {/* Expanded */}
                                {isExp && (
                                    <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        {/* Type selector */}
                                        <div style={{ display: 'flex', gap: 4, paddingTop: 8 }}>
                                            {(['directional', 'point', 'spot'] as LightType[]).map(t => (
                                                <button key={t} onClick={() => updLight(l.id, { type: t })}
                                                    style={{ flex: 1, padding: '5px 0', border: '1px solid', borderRadius: 7, fontSize: 9, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', borderColor: l.type === t ? '#22c55e' : 'rgba(255,255,255,0.1)', background: l.type === t ? 'rgba(34,197,94,0.1)' : 'transparent', color: l.type === t ? '#22c55e' : '#94a3b8' }}>
                                                    {t === 'directional' ? '☀️ Dir' : t === 'point' ? '💡 Point' : '🔦 Spot'}
                                                </button>
                                            ))}
                                        </div>

                                        <input value={l.name} onChange={e => updLight(l.id, { name: e.target.value })}
                                            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 9px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, fontSize: 11, outline: 'none', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'inherit' }} />

                                        {/* Color + Intensity */}
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <div style={{ position: 'relative', width: 32, height: 32, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                                                <input type="color" value={l.color} onChange={e => updLight(l.id, { color: e.target.value })}
                                                    style={{ position: 'absolute', inset: -5, width: 42, height: 42, cursor: 'pointer', border: 'none' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginBottom: 3, textTransform: 'uppercase', fontWeight: 700 }}>
                                                    <span>Intensity</span><span style={{ color: '#22c55e' }}>{l.intensity.toFixed(2)}</span>
                                                </div>
                                                <input type="range" min={0} max={5} step={0.05} value={l.intensity}
                                                    onChange={e => updLight(l.id, { intensity: +e.target.value })}
                                                    style={{ width: '100%', accentColor: '#22c55e', height: 2 }} />
                                            </div>
                                        </div>

                                        {/* X Y Z */}
                                        {([['X', 'x', '#ef4444'], ['Y', 'y', '#22c55e'], ['Z', 'z', '#3b82f6']] as const).map(([label, axis, col]) => (
                                            <div key={axis}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 2 }}>
                                                    <span style={{ color: col, fontWeight: 900 }}>{label}</span>
                                                    <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{l[axis as 'x' | 'y' | 'z'].toFixed(1)}</span>
                                                </div>
                                                <input type="range" min={-8} max={8} step={0.1}
                                                    value={l[axis as 'x' | 'y' | 'z']}
                                                    onChange={e => updLight(l.id, { [axis]: +e.target.value })}
                                                    style={{ width: '100%', accentColor: col, height: 2 }} />
                                            </div>
                                        ))}

                                        <button onClick={() => delLight(l.id)}
                                            style={{ marginTop: 4, padding: '6px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            🗑 Delete Light
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
