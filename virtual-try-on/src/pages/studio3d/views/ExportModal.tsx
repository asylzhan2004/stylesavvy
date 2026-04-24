import { motion } from 'framer-motion';
import type { CaptureRequest } from '../types';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (req: CaptureRequest) => void;
    loading: string | null;
    currentLang: string;
}

const text = (lang: string, en: string, ru: string, kz: string) =>
    lang === 'ru' ? ru : lang === 'kz' ? kz : en;

export function ExportModal({ isOpen, onClose, onExport, loading, currentLang }: ExportModalProps) {
    const t = (en: string, ru: string, kz: string) => text(currentLang, en, ru, kz);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} 
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{ 
                    position: 'relative', width: '100%', maxWidth: 500, background: '#111', borderRadius: 24, 
                    border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' 
                }}
            >
                <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>
                        {t('Export Design', 'Экспорт дизайна', 'Дизайнды экспорттау')}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 24, cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ padding: 30, display: 'grid', gap: 16 }}>
                    <p style={{ margin: 0, color: '#888', fontSize: 14, lineHeight: 1.6 }}>
                        {t('Choose how you want to save your creation. High-resolution captures take a moment to process.', 
                           'Выберите способ сохранения вашего творения. Обработка снимков высокого разрешения занимает некоторое время.', 
                           'Туындыңызды сақтау жолын таңдаңыз. Жоғары сапалы суреттерді өңдеуге біраз уақыт кетеді.')}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                        <ExportButton 
                            title="PNG Image" 
                            desc="Standard capture" 
                            icon="🖼️" 
                            onClick={() => onExport({ type: 'png', quality: 1 })}
                            loading={loading === 'PNG'}
                        />
                        <ExportButton 
                            title="4K Render" 
                            desc="HQ Quality" 
                            icon="✨" 
                            onClick={() => onExport({ type: 'png', quality: 2 })}
                            loading={loading === 'PNG'}
                        />
                        <ExportButton 
                            title="Texture Map" 
                            desc="UV Unwrap" 
                            icon="🗺️" 
                            onClick={() => onExport({ type: 'png', quality: 1 })}
                            loading={loading === 'TEXTURE'}
                        />
                        <ExportButton 
                            title="3D Model" 
                            desc="GLB File" 
                            icon="📦" 
                            onClick={() => onExport({ type: 'glb' })}
                            loading={loading === 'GLB'}
                        />
                    </div>
                </div>

                <div style={{ padding: '20px 30px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <button 
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#22c55e', fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                        {t('Cancel', 'Отмена', 'Бас тарту')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function ExportButton({ title, desc, icon, onClick, loading }: { title: string, desc: string, icon: string, onClick: () => void, loading: boolean }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={loading}
            style={{ 
                padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center'
            }}
        >
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{loading ? 'Processing...' : title}</div>
            <div style={{ fontSize: 10, color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>{desc}</div>
        </motion.button>
    );
}
