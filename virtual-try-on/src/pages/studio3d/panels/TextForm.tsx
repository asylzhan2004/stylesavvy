import { FONTS } from '../constants';
import { szBtn } from '../styles';

interface TextFormProps {
    txtVal: string; setTxtVal: (v: string) => void;
    txtColor: string; setTxtColor: (c: string) => void;
    txtSize: number; setTxtSize: (s: number) => void;
    txtFont: string; setTxtFont: (f: string) => void;
    addTextAuto: () => void;
    addTextAsPaint: () => void;
    addTextAsDecal: () => void;
}

export function TextForm({
    txtVal, setTxtVal, txtColor, setTxtColor,
    txtSize, setTxtSize, txtFont, setTxtFont,
    addTextAuto, addTextAsPaint, addTextAsDecal,
}: TextFormProps) {
    return (
        <div style={{ padding: '14px 16px', background: 'rgba(34,197,94,0.04)', borderRadius: 14, border: '1px solid rgba(34,197,94,0.12)', marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Add Text</div>

            <textarea value={txtVal} onChange={e => setTxtVal(e.target.value)}
                placeholder="Type your text..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, background: 'rgba(0,0,0,0.25)', color: '#f1f5f9', fontFamily: 'inherit', lineHeight: 1.5 }} />

            {/* Font picker */}
            <div style={{ marginTop: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 5 }}>Font</div>
                <select value={txtFont} onChange={e => setTxtFont(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
                <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', fontSize: Math.min(txtSize, 20), fontFamily: txtFont, color: txtColor, textAlign: 'center', minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {txtVal || 'Preview'}
                </div>
            </div>

            {/* Size + Color */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 5 }}>Size: {txtSize}px</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => setTxtSize(Math.max(8, txtSize - 2))} style={szBtn}>−</button>
                        <input type="range" min={8} max={120} value={txtSize} onChange={e => setTxtSize(+e.target.value)} style={{ flex: 1, accentColor: '#22c55e' }} />
                        <button onClick={() => setTxtSize(Math.min(120, txtSize + 2))} style={szBtn}>+</button>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 5 }}>Color</div>
                    <div style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ position: 'absolute', inset: 0, background: txtColor }} />
                        <input type="color" value={txtColor} onChange={e => setTxtColor(e.target.value)}
                            style={{ position: 'absolute', inset: -4, width: 44, height: 44, cursor: 'pointer', border: 'none', opacity: 0 }} />
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={addTextAuto} disabled={!txtVal.trim()}
                    style={{ padding: '10px', borderRadius: 10, border: 'none', background: txtVal.trim() ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.05)', color: txtVal.trim() ? 'white' : '#555', fontWeight: 800, fontSize: 12, cursor: txtVal.trim() ? 'pointer' : 'default', fontFamily: 'inherit', letterSpacing: '0.04em', transition: 'all 0.2s', boxShadow: txtVal.trim() ? '0 4px 16px rgba(34,197,94,0.3)' : 'none' }}>
                    ✚ Add Text (Auto)
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={addTextAsPaint} disabled={!txtVal.trim()}
                        style={{ flex: 1, padding: '8px 6px', borderRadius: 9, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontWeight: 700, fontSize: 10, cursor: txtVal.trim() ? 'pointer' : 'default', fontFamily: 'inherit', opacity: txtVal.trim() ? 1 : 0.5 }}>
                        🖌️ As Paint
                    </button>
                    <button onClick={addTextAsDecal} disabled={!txtVal.trim()}
                        style={{ flex: 1, padding: '8px 6px', borderRadius: 9, border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)', color: '#c4b5fd', fontWeight: 700, fontSize: 10, cursor: txtVal.trim() ? 'pointer' : 'default', fontFamily: 'inherit', opacity: txtVal.trim() ? 1 : 0.5 }}>
                        📌 As Decal
                    </button>
                </div>
            </div>
        </div>
    );
}
