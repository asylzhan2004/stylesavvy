import React from 'react';
import { motion } from 'framer-motion';
import { FABRIC_TEXTURES } from '../constants';

interface FabricPanelProps {
    selectedPart: string;
    fabric: string;
    setFabric: (id: string) => void;
    partFabrics: Record<string, string>;
    setPartFabrics: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function FabricPanel({ selectedPart, fabric, setFabric, partFabrics, setPartFabrics }: FabricPanelProps) {
    const isAll = selectedPart === 'all';

    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', marginBottom: 10 }}>Material Texture</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                {FABRIC_TEXTURES.map(f => {
                    const isActive = isAll ? fabric === f.id : partFabrics[selectedPart] === f.id;
                    return (
                        <motion.button key={f.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (isAll) setFabric(f.id);
                                else setPartFabrics(prev => ({ ...prev, [selectedPart]: f.id }));
                            }}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                padding: '12px 6px', borderRadius: 8,
                                background: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                                border: isActive ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer', transition: 'all 0.2s', color: isActive ? '#22c55e' : '#cbd5e1',
                            }}>
                            <span style={{ fontSize: 24, paddingBottom: 4 }}>{f.icon}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, textAlign: 'center' }}>{f.name}</span>
                        </motion.button>
                    );
                })}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 12, lineHeight: 1.4, textAlign: 'center' }}>
                Текстура смешивается с базовым цветом. Для наиболее реалистичного вида выберите белый цвет.
            </div>
        </div>
    );
}
