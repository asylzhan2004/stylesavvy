import { motion } from 'framer-motion';
import { MODELS } from '../constants';

interface ModelSwitcherProps {
    modelId: string;
    setModelId: (id: string) => void;
    gender: string | null;
    category: string | null;
}

export function ModelSwitcher({ modelId, setModelId, gender, category }: ModelSwitcherProps) {
    const filtered = MODELS.filter(m =>
        (!m.gender || !gender || m.gender === gender) &&
        (!m.category || !category || m.category === category)
    );
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: 10 }}>3D Model</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {filtered.map(m => (
                    <motion.button key={m.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setModelId(m.id)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 8, background: modelId === m.id ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)', border: modelId === m.id ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', color: modelId === m.id ? '#22c55e' : '#cbd5e1' }}>
                        <span style={{ fontSize: 24, paddingBottom: 4 }}>👕</span>
                        <span style={{ fontSize: 10, fontWeight: 700, textAlign: 'center' }}>{m.name}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
