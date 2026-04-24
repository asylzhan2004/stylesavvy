import type { GradientConfig } from '../types';
import { PALETTE_GROUPS, QUICK_TONE_PRESETS, DEFAULT_GRADIENT } from '../constants';

interface ColorPanelProps {
    colorTab: 'swatches' | 'spectrum' | 'gradient';
    setColorTab: (t: 'swatches' | 'spectrum' | 'gradient') => void;
    selectedPart: string;
    shirtColor: string;
    setShirtColor: (c: string) => void;
    shirtGradient: GradientConfig;
    setShirtGradient: React.Dispatch<React.SetStateAction<GradientConfig>>;
    partColors: Record<string, string>;
    setPartColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    partGradients: Record<string, GradientConfig>;
    setPartGradients: React.Dispatch<React.SetStateAction<Record<string, GradientConfig>>>;
}

export function ColorPanel({
    colorTab, setColorTab,
    selectedPart,
    shirtColor, setShirtColor,
    shirtGradient, setShirtGradient,
    partColors, setPartColors,
    partGradients, setPartGradients,
}: ColorPanelProps) {
    const isAll = selectedPart === 'all';
    const curColor = isAll ? shirtColor : (partColors[selectedPart] || shirtColor);
    const curGrad = isAll ? shirtGradient : (partGradients[selectedPart] || shirtGradient);

    const applyColor = (c: string) => {
        if (isAll) { setShirtColor(c); setShirtGradient(g => ({ ...g, enabled: false })); }
        else { setPartColors(p => ({ ...p, [selectedPart]: c })); setPartGradients(p => ({ ...p, [selectedPart]: { ...(p[selectedPart] || DEFAULT_GRADIENT), enabled: false } })); }
    };

    const applyGrad = (g: Partial<GradientConfig>) => {
        if (isAll) setShirtGradient(prev => ({ ...prev, ...g }));
        else setPartGradients(prev => ({ ...prev, [selectedPart]: { ...(prev[selectedPart] || DEFAULT_GRADIENT), ...g } }));
    };

    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: 12 }}>Shirt Color &amp; Gradient</div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {(['swatches', 'spectrum', 'gradient'] as const).map(tab => (
                    <button key={tab} onClick={() => setColorTab(tab)}
                        style={{ flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: colorTab === tab ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.08)', background: colorTab === tab ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)', color: colorTab === tab ? '#22c55e' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {tab === 'swatches' ? '🎨' : tab === 'spectrum' ? '🌈' : '✨'} {tab}
                    </button>
                ))}
            </div>

            {/* SWATCHES */}
            {colorTab === 'swatches' && (
                <div>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Quick Tones</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {QUICK_TONE_PRESETS.map(preset => (
                                <button key={preset.name} onClick={() => {
                                    const c = preset.colors[0];
                                    if (isAll) { setShirtColor(c); setShirtGradient({ ...DEFAULT_GRADIENT, enabled: true, type: 'linear', color1: preset.colors[0], color2: preset.colors[preset.colors.length - 1], angle: 135 }); }
                                    else { setPartColors(p => ({ ...p, [selectedPart]: c })); setPartGradients(p => ({ ...p, [selectedPart]: { ...DEFAULT_GRADIENT, enabled: true, color1: preset.colors[0], color2: preset.colors[preset.colors.length - 1], angle: 135 } })); }
                                }} title={preset.name}
                                    style={{ display: 'flex', gap: 2, padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                                    {preset.colors.map(c => <div key={c} style={{ width: 10, height: 16, borderRadius: 2, background: c }} />)}
                                </button>
                            ))}
                        </div>
                    </div>
                    {PALETTE_GROUPS.map(group => (
                        <div key={group.label} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 5 }}>{group.label}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {group.colors.map(c => {
                                    const active = curColor === c;
                                    return (
                                        <button key={c} title={c} onClick={() => applyColor(c)}
                                            style={{ width: 22, height: 22, borderRadius: 5, background: c, border: active ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', boxShadow: active ? '0 0 0 2px rgba(34,197,94,0.4)' : 'none', transition: 'all 0.15s', flexShrink: 0 }} />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {/* Custom picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ position: 'relative', width: 28, height: 28, borderRadius: 7, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', inset: 0, background: curColor }} />
                            <input type="color" value={curColor} onChange={e => applyColor(e.target.value)} style={{ position: 'absolute', inset: -4, width: 36, height: 36, cursor: 'pointer', border: 'none', opacity: 0 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{curColor}</span>
                        <span style={{ fontSize: 10, color: '#334155', marginLeft: 'auto' }}>Custom</span>
                    </div>
                </div>
            )}

            {/* SPECTRUM */}
            {colorTab === 'spectrum' && (
                <div>
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 10 }}>Pick any color from the full spectrum</div>
                    {/* Hue bar */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Hue</div>
                        <div style={{ position: 'relative', height: 24, borderRadius: 8, background: 'linear-gradient(90deg,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)', cursor: 'crosshair' }}
                            onClick={e => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const pct = (e.clientX - rect.left) / rect.width;
                                const h = Math.round(pct * 360);
                                const c = (n: number) => { const k = (n + h / 30) % 12; const a = 1 - Math.min(k - 3, 9 - k, 1); return Math.round(255 * a); };
                                const hex = '#' + [0, 8, 4].map(n => c(n).toString(16).padStart(2, '0')).join('');
                                applyColor(hex);
                            }} />
                    </div>
                    {/* Saturation rows */}
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Saturation Rows</div>
                        {[
                            ['#ffb3b3', '#ffccb3', '#fff3b3', '#b3ffb3', '#b3e0ff', '#d9b3ff', '#ffb3e6'],
                            ['#ff6666', '#ff8c42', '#ffd600', '#69ff47', '#47d3ff', '#b347ff', '#ff47c8'],
                            ['#cc0000', '#cc5500', '#ccaa00', '#00aa00', '#0055cc', '#7700cc', '#cc0077'],
                            ['#660000', '#663300', '#666600', '#006600', '#003366', '#440066', '#660044'],
                        ].map((row, ri) => (
                            <div key={ri} style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                                {row.map(c => (
                                    <div key={c} onClick={() => applyColor(c)}
                                        style={{ flex: 1, height: 18, borderRadius: 4, background: c, cursor: 'pointer', border: curColor === c ? '2px solid #22c55e' : '1px solid transparent', transition: 'all 0.1s' }} />
                                ))}
                            </div>
                        ))}
                    </div>
                    {/* Hex input */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ position: 'relative', width: 28, height: 28, borderRadius: 7, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', inset: 0, background: curColor }} />
                            <input type="color" value={curColor} onChange={e => applyColor(e.target.value)} style={{ position: 'absolute', inset: -4, width: 36, height: 36, cursor: 'pointer', border: 'none', opacity: 0 }} />
                        </div>
                        <input value={curColor} onChange={e => { const v = e.target.value; if (/^#[0-9A-Fa-f]{6}$/.test(v)) applyColor(v); }}
                            style={{ flex: 1, background: 'transparent', border: 'none', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12, outline: 'none' }} />
                    </div>
                </div>
            )}

            {/* GRADIENT */}
            {colorTab === 'gradient' && (
                <div>
                    {/* Enable toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Enable Gradient</span>
                        <div onClick={() => applyGrad({ enabled: !curGrad.enabled })}
                            style={{ width: 40, height: 22, borderRadius: 11, background: curGrad.enabled ? '#22c55e' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.25s' }}>
                            <div style={{ position: 'absolute', top: 3, left: curGrad.enabled ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                        </div>
                    </div>

                    {/* Preview */}
                    <div style={{ height: 36, borderRadius: 10, marginBottom: 14, border: '1px solid rgba(255,255,255,0.08)', background: curGrad.enabled ? (curGrad.type === 'radial' ? `radial-gradient(circle,${curGrad.color1} ${curGrad.stop1 * 100}%,${curGrad.color2} ${curGrad.stop2 * 100}%)` : `linear-gradient(${curGrad.angle}deg,${curGrad.color1} ${curGrad.stop1 * 100}%,${curGrad.color2} ${curGrad.stop2 * 100}%)`) : curColor }} />

                    {/* Type */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Type</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {(['linear', 'radial'] as const).map(t => (
                                <button key={t} onClick={() => applyGrad({ type: t })}
                                    style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: curGrad.type === t ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.08)', background: curGrad.type === t ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)', color: curGrad.type === t ? '#22c55e' : '#94a3b8' }}>
                                    {t === 'linear' ? '↗ Linear' : '◎ Radial'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color stops */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 8 }}>Color Stops</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[{ label: 'Color 1', key: 'color1' as const, val: curGrad.color1 }, { label: 'Color 2', key: 'color2' as const, val: curGrad.color2 }].map(item => (
                                <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ fontSize: 9, color: '#64748b' }}>{item.label}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <div style={{ position: 'relative', width: 24, height: 24, borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                                            <div style={{ position: 'absolute', inset: 0, background: item.val }} />
                                            <input type="color" value={item.val} onChange={e => applyGrad({ [item.key]: e.target.value, enabled: true })}
                                                style={{ position: 'absolute', inset: -4, width: 32, height: 32, cursor: 'pointer', border: 'none', opacity: 0 }} />
                                        </div>
                                        <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#64748b' }}>{item.val.toUpperCase()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stop positions */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Stop Positions</div>
                        {[{ label: 'Stop 1', key: 'stop1' as const, val: curGrad.stop1 }, { label: 'Stop 2', key: 'stop2' as const, val: curGrad.stop2 }].map(s => (
                            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 9, color: '#64748b', width: 38 }}>{s.label}</span>
                                <input type="range" min={0} max={1} step={0.01} value={s.val}
                                    onChange={e => applyGrad({ [s.key]: parseFloat(e.target.value), enabled: true })}
                                    style={{ flex: 1, accentColor: '#22c55e' }} />
                                <span style={{ fontSize: 9, color: '#94a3b8', width: 28, textAlign: 'right' }}>{Math.round(s.val * 100)}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Angle (linear only) */}
                    {curGrad.type === 'linear' && (
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Angle</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input type="range" min={0} max={360} step={1} value={curGrad.angle}
                                    onChange={e => applyGrad({ angle: parseInt(e.target.value), enabled: true })}
                                    style={{ flex: 1, accentColor: '#22c55e' }} />
                                <span style={{ fontSize: 10, color: '#94a3b8', width: 36, textAlign: 'right' }}>{curGrad.angle}°</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                                {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                                    <button key={a} onClick={() => applyGrad({ angle: a, enabled: true })}
                                        style={{ padding: '3px 7px', borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: 'pointer', border: curGrad.angle === a ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.08)', background: curGrad.angle === a ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)', color: curGrad.angle === a ? '#22c55e' : '#64748b' }}>
                                        {a}°
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gradient presets */}
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Presets</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
                            {[
                                { name: 'Ocean', c1: '#0D1B2A', c2: '#42A5F5', a: 135 },
                                { name: 'Sunset', c1: '#4A0080', c2: '#FF5722', a: 135 },
                                { name: 'Forest', c1: '#1B5E20', c2: '#A5D6A7', a: 180 },
                                { name: 'Rose', c1: '#880E4F', c2: '#FCE4EC', a: 120 },
                                { name: 'Fire', c1: '#7F0000', c2: '#FDD835', a: 90 },
                                { name: 'Sky', c1: '#1565C0', c2: '#E0F7FA', a: 180 },
                                { name: 'Night', c1: '#0A0A0A', c2: '#4A148C', a: 135 },
                                { name: 'Gold', c1: '#3E2723', c2: '#FDD835', a: 135 },
                                { name: 'Mint', c1: '#004D40', c2: '#B2DFDB', a: 160 },
                            ].map(p => (
                                <button key={p.name} onClick={() => applyGrad({ enabled: true, type: 'linear', color1: p.c1, color2: p.c2, angle: p.a, stop1: 0, stop2: 1 })}
                                    style={{ padding: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', overflow: 'hidden' }}>
                                    <div style={{ height: 28, background: `linear-gradient(${p.a}deg,${p.c1} 0%,${p.c2} 100%)` }} />
                                    <div style={{ padding: '3px 4px', fontSize: 8, fontWeight: 700, color: '#64748b', background: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>{p.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
