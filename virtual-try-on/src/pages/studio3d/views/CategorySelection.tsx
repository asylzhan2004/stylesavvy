import { motion } from 'framer-motion';
import { CATEGORY_DATA, MODELS } from '../constants';

interface CategorySelectionProps {
    currentLang: string;
    gender: 'men' | 'women';
    setCategory: (c: string) => void;
    setModelId: (id: string) => void;
    setStudioStep: (s: 'gender' | 'category' | 'editor') => void;
}

const text = (lang: string, en: string, ru: string, kz: string) =>
    lang === 'ru' ? ru : lang === 'kz' ? kz : en;

export function CategorySelection({ currentLang, gender, setCategory, setModelId, setStudioStep }: CategorySelectionProps) {
    const t = (en: string, ru: string, kz: string) => text(currentLang, en, ru, kz);
    const accent = gender === 'women' ? '#f5c56f' : '#7efc8d';
    const accentSoft = gender === 'women' ? 'rgba(245,197,111,0.16)' : 'rgba(126,252,141,0.16)';
    const cats = CATEGORY_DATA[gender];

    return (
        <motion.div key="category"
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.97 }} transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gap: 20 }}>

            {/* Header */}
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 34, padding: 'clamp(24px,4vw,34px)', background: 'linear-gradient(180deg,rgba(16,22,19,0.88) 0%,rgba(8,10,9,0.95) 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 34px 80px rgba(0,0,0,0.28)' }}>
                <div style={{ position: 'absolute', right: '-8%', top: '-16%', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle,${accentSoft} 0%,transparent 70%)`, filter: 'blur(6px)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#dfffe4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {t('Step 2', 'Шаг 2', '2-қадам')}
                            </span>
                            <span style={{ padding: '8px 12px', borderRadius: 999, background: accentSoft, border: `1px solid ${accent}33`, color: '#f7fff8', fontSize: 12, fontWeight: 700 }}>
                                {gender === 'men' ? t('Men selected', 'Выбраны мужчины', 'Ерлер таңдалды') : t('Women selected', 'Выбраны женщины', 'Әйелдер таңдалды')}
                            </span>
                        </div>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,6vw,54px)', lineHeight: 0.98, margin: 0, fontWeight: 600, letterSpacing: '-0.05em', color: '#f8fff9' }}>
                                {t('Choose a category', 'Выберите категорию', 'Санатты таңдаңыз')}
                            </h2>
                            <p style={{ marginTop: 14, color: '#a6b4a9', fontSize: 15, lineHeight: 1.75, maxWidth: 700 }}>
                                {t('Pick the garment family to open first.', 'Выберите группу одежды, которую хотите открыть первой.', 'Алдымен ашылатын киім тобын таңдаңыз.')}
                            </p>
                        </div>
                    </div>
                    <motion.button whileHover={{ x: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setStudioStep('gender')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#eef7f0', padding: '12px 16px', borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                        {t('Change gender', 'Сменить пол', 'Жынысты өзгерту')}
                    </motion.button>
                </div>
            </div>

            {/* Category cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
                {cats.map(cat => (
                    <motion.button key={cat.id}
                        whileHover={{ y: -6, scale: 1.01, borderColor: `${accent}55`, boxShadow: `0 24px 48px ${accentSoft}` }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                            setCategory(cat.id);
                            const first = MODELS.find(m => m.gender === gender && m.category === cat.id);
                            if (first) setModelId(first.id);
                            setStudioStep('editor');
                        }}
                        style={{ position: 'relative', minHeight: 205, padding: '22px 20px', borderRadius: 26, overflow: 'hidden', background: 'linear-gradient(180deg,rgba(18,22,20,0.94) 0%,rgba(9,11,10,0.98) 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 22px 48px rgba(0,0,0,0.24)', display: 'grid', alignContent: 'space-between', gap: 18, cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ position: 'absolute', right: -28, bottom: -36, width: 150, height: 150, borderRadius: '50%', background: accentSoft, filter: 'blur(30px)', pointerEvents: 'none' }} />
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: accentSoft, border: `1px solid ${accent}33`, borderRadius: 18, flexShrink: 0, fontSize: 28 }}>
                                {cat.icon}
                            </div>
                            <div style={{ padding: '7px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: '#d7e4d9', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {t('Ready', 'Готово', 'Дайын')}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#f5fff6', fontSize: 22, fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                                {currentLang === 'ru' ? cat.name.ru : cat.name.en}
                            </div>
                            <div style={{ color: '#91a394', fontSize: 14, lineHeight: 1.65, marginTop: 10 }}>
                                {t('Open this garment family in the 3D editor.', 'Откройте эту группу в 3D-редакторе.', 'Осы киім тобын 3D редакторда ашыңыз.')}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', color: '#eff9f0', fontSize: 13, fontWeight: 800 }}>
                            <span>{t('Choose', 'Выбрать', 'Таңдау')}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
                            </svg>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
