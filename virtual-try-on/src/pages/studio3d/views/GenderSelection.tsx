import { motion } from 'framer-motion';
import { CATEGORY_DATA } from '../constants';

interface GenderSelectionProps {
    currentLang: string;
    setGender: (g: 'men' | 'women') => void;
    setStudioStep: (s: 'gender' | 'category' | 'editor') => void;
}

const text = (lang: string, en: string, ru: string, kz: string) =>
    lang === 'ru' ? ru : lang === 'kz' ? kz : en;

export function GenderSelection({ currentLang, setGender, setStudioStep }: GenderSelectionProps) {
    const t = (en: string, ru: string, kz: string) => text(currentLang, en, ru, kz);

    const cards = [
        {
            id: 'men' as const,
            icon: '👨',
            accent: '#7efc8d',
            accentSoft: 'rgba(126,252,141,0.14)',
            glow: 'radial-gradient(circle at top,rgba(126,252,141,0.30) 0%,rgba(126,252,141,0.06) 42%,transparent 74%)',
            title: t('Men', 'Мужчины', 'Ерлер'),
            description: t('Outerwear, tops, bottoms and footwear on the male mannequin.', 'Верхняя одежда, топы, низ и обувь под мужской манекен.', 'Сыртқы киім, үстіңгі, төменгі және аяқ киім ерлер манекеніне.'),
            groups: t(`${CATEGORY_DATA.men.length} ready groups`, `${CATEGORY_DATA.men.length} готовых групп`, `${CATEGORY_DATA.men.length} дайын топ`),
        },
        {
            id: 'women' as const,
            icon: '👩',
            accent: '#f5c56f',
            accentSoft: 'rgba(245,197,111,0.14)',
            glow: 'radial-gradient(circle at top,rgba(245,197,111,0.30) 0%,rgba(245,197,111,0.06) 42%,transparent 74%)',
            title: t('Women', 'Женщины', 'Әйелдер'),
            description: t('Tops, dresses, bottoms and footwear on the female mannequin.', 'Топы, платья, низ и обувь под женский манекен.', 'Үстіңгі, көйлек, төменгі және аяқ киім әйелдер манекеніне.'),
            groups: t(`${CATEGORY_DATA.women.length} ready groups`, `${CATEGORY_DATA.women.length} готовых групп`, `${CATEGORY_DATA.women.length} дайын топ`),
        },
    ];

    return (
        <motion.div key="gender"
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.97 }} transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(18px,3vw,28px)', alignItems: 'stretch' }}>

            {/* Left info card */}
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 34, padding: 'clamp(24px,4vw,36px)', background: 'linear-gradient(180deg,rgba(16,22,19,0.88) 0%,rgba(8,10,9,0.94) 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 34px 80px rgba(0,0,0,0.28)', display: 'grid', alignContent: 'space-between', gap: 28 }}>
                <div style={{ position: 'absolute', right: '-12%', top: '-10%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(126,252,141,0.18) 0%,transparent 68%)', filter: 'blur(4px)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#dfffe4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {t('Step 1', 'Шаг 1', '1-қадам')}
                    </span>
                    <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(126,252,141,0.10)', border: '1px solid rgba(126,252,141,0.12)', color: '#dfffe4', fontSize: 12, fontWeight: 700 }}>
                        {t('Studio setup', 'Подготовка студии', 'Студияны дайындау')}
                    </span>
                </div>
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,7vw,64px)', lineHeight: 0.95, margin: 0, fontWeight: 600, letterSpacing: '-0.05em', color: '#f8fff9' }}>
                        {t('Choose gender', 'Выберите пол', 'Жынысты таңдаңыз')}
                    </h2>
                    <p style={{ marginTop: 16, color: '#a6b4a9', fontSize: 16, lineHeight: 1.75, maxWidth: 480 }}>
                        {t('The studio will match the mannequin, garment scale and categories before the editor opens.', 'Студия подберёт манекен, масштаб одежды и категории перед открытием редактора.', 'Редактор ашылар алдында студия манекенді және санаттарды дайындайды.')}
                    </p>
                </div>
            </div>

            {/* Gender cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 18 }}>
                {cards.map(opt => (
                    <motion.button key={opt.id}
                        whileHover={{ y: -8, scale: 1.01, borderColor: `${opt.accent}66`, boxShadow: `0 28px 56px ${opt.accentSoft}` }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => { setGender(opt.id); setStudioStep('category'); }}
                        style={{ position: 'relative', minHeight: 330, borderRadius: 30, padding: 26, overflow: 'hidden', background: `linear-gradient(180deg,rgba(20,24,22,0.94) 0%,rgba(10,11,11,0.98) 100%)`, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', display: 'grid', gap: 20, alignContent: 'space-between', textAlign: 'left', cursor: 'pointer' }}>
                        <div style={{ position: 'absolute', inset: 0, background: opt.glow, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', right: -36, bottom: -48, width: 180, height: 180, borderRadius: '50%', background: opt.accentSoft, filter: 'blur(28px)', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9e7dc', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {t('3D ready', '3D готово', '3D дайын')}
                            </span>
                            <span style={{ color: opt.accent, fontSize: 14, fontWeight: 800 }}>01</span>
                        </div>
                        <div style={{ position: 'relative', display: 'grid', gap: 18 }}>
                            <div style={{ width: 82, height: 82, borderRadius: 26, background: `linear-gradient(180deg,${opt.accentSoft} 0%,rgba(255,255,255,0.03) 100%)`, border: `1px solid ${opt.accent}33`, display: 'grid', placeItems: 'center', fontSize: 44, boxShadow: `0 16px 36px ${opt.accentSoft}` }}>
                                {opt.icon}
                            </div>
                            <div>
                                <div style={{ color: '#f8fff9', fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{opt.title}</div>
                                <div style={{ color: '#95a597', fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>{opt.description}</div>
                            </div>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            <span style={{ padding: '9px 12px', borderRadius: 999, background: opt.accentSoft, border: `1px solid ${opt.accent}33`, color: '#f3fff5', fontSize: 12, fontWeight: 700 }}>{opt.groups}</span>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', color: '#f7fff8', fontSize: 13, fontWeight: 800 }}>
                            <span>{t('Continue to categories', 'К категориям', 'Санаттарға өту')}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={opt.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
                            </svg>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
