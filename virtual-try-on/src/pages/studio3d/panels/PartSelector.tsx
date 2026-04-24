interface PartSelectorProps {
    availableParts: string[];
    selectedPart: string;
    setSelectedPart: (p: string) => void;
}

export function PartSelector({ availableParts, selectedPart, setSelectedPart }: PartSelectorProps) {
    if (availableParts.length <= 1) return null;
    return (
        <div style={{ marginBottom: 20, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Select Part</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button onClick={() => setSelectedPart('all')}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: selectedPart === 'all' ? '#22c55e' : 'rgba(255,255,255,0.05)', color: selectedPart === 'all' ? '#fff' : '#cbd5e1' }}>
                    All Parts
                </button>
                {availableParts.map(p => (
                    <button key={p} onClick={() => setSelectedPart(p)}
                        style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: selectedPart === p ? '#22c55e' : 'rgba(255,255,255,0.05)', color: selectedPart === p ? '#fff' : '#cbd5e1' }}>
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}
