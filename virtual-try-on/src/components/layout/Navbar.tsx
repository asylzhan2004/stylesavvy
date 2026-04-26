import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useOutfitStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useT, useLangStore } from '../../i18n/store';
import type { Lang } from '../../i18n/translations';

// Item keys for translation lookup
const menuItemKeys: Record<string, string> = {
    'Originals': 'nav.originals', 'Running': 'nav.running', 'Football': 'nav.football',
    'Basketball': 'nav.basketball', 'Slides': 'nav.slides', 'Training': 'nav.training',
    'Youth': 'nav.youth', 'Children': 'nav.children', 'Toddler': 'nav.toddler',
    'T-Shirts': 'nav.tshirts', 'Hoodies': 'nav.hoodies', 'Pants': 'nav.pants',
    'Shorts': 'nav.shorts', 'Jackets': 'nav.jackets', 'Leggings': 'nav.leggings',
    'Sports Bras': 'nav.sportsbras', 'Sets': 'nav.sets',
    'Bags': 'nav.bags', 'Socks': 'nav.socks', 'Hats': 'nav.hats',
    'Balls': 'nav.balls', 'Headbands': 'nav.headbands',
};

const sectionTitleKeys: Record<string, string> = {
    'SHOES': 'nav.shoes', 'CLOTHING': 'nav.clothing', 'ACCESSORIES': 'nav.accessories',
};

export function Navbar() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isCompact, setIsCompact] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const t = useT();
    const lang = useLangStore((state) => state.lang);
    const studioFirstNav = typeof window !== 'undefined';

    useEffect(() => {
        let rafId: number;
        const handleResize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => setIsCompact(window.innerWidth < 980));
        };

        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });
        return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(rafId); };
    }, []);

    if (studioFirstNav) {
        const isRu = lang === 'ru';
        const isKz = lang === 'kz';
        const text = (en: string, ru: string, kz: string) => (isRu ? ru : isKz ? kz : en);
        const links = [
            { label: text('Overview', 'Главный экран', 'Басты экран'), hash: '#overview' },
            { label: text('Clothing groups', 'Группы одежды', 'Киім топтары'), hash: '#categories' },
            { label: text('3D workflow', '3D-поток', '3D ағын'), hash: '#facts' },
        ];

        const goToSection = (hash: string) => {
            setMenuOpen(false);

            if (window.location.pathname !== '/') {
                navigate(`/${hash}`);
                window.setTimeout(() => {
                    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
                return;
            }

            document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', hash);
        };

        return (
            <motion.div className="navbar-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 110, damping: 20 }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', padding: isCompact ? '0 16px' : '0 28px', height: '76px', background: 'rgba(4, 7, 5, 0.82)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(126, 252, 141, 0.1)', boxShadow: '0 0 24px rgba(0,0,0,0.28)' }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: 'none', background: 'transparent', color: '#ffffff', cursor: 'pointer', padding: 0 }}>
                        <svg viewBox="0 0 50 34" width="42" height="28" fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px rgba(57,255,20,0.3))' }}>
                            <path d="M12.9 24.3L4.1 24.3L15.3 5.7L24.1 5.7L12.9 24.3ZM26.8 24.3L18 24.3L29.2 5.7L38 5.7L26.8 24.3ZM40.7 24.3L31.9 24.3L43.1 5.7L51.9 5.7L40.7 24.3Z" transform="scale(0.6) translate(15,10)" />
                        </svg>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontFamily: 'var(--font-punk)', fontSize: isCompact ? '24px' : '28px', lineHeight: 0.92, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#deffe5' }}>
                                Style Savvy
                            </div>
                            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8da595' }}>
                                {text('virtual fitting', 'онлайн-примерка', 'онлайн киіп көру')}
                            </div>
                        </div>
                    </motion.button>

                    {!isCompact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {links.map((link) => (
                                <motion.button key={link.hash} whileHover={{ color: '#dcffe3' }} onClick={() => goToSection(link.hash)} style={{ padding: '11px 15px', borderRadius: '999px', border: '1px solid transparent', background: 'transparent', color: '#9cb29f', fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                    {link.label}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? '10px' : '14px' }}>
                        <LanguageSwitcher />
                        {!isCompact && <UserStatus />}
                        {!isCompact && (
                            <Link to="/studio" style={{ textDecoration: 'none' }}>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} style={{ padding: '13px 18px', borderRadius: '999px', border: '1px solid rgba(126, 252, 141, 0.18)', background: 'linear-gradient(135deg, rgba(57,255,20,0.18) 0%, rgba(14,44,24,0.88) 100%)', color: '#f4fff5', fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    {text('Open 3D Studio', 'Открыть 3D Studio', '3D Studio ашу')}
                                </motion.div>
                            </Link>
                        )}
                        {isCompact && (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setMenuOpen((open) => !open)} style={{ minWidth: '44px', height: '44px', borderRadius: '14px', border: '1px solid rgba(126, 252, 141, 0.14)', background: 'rgba(8, 13, 10, 0.88)', color: '#e5ffe9', cursor: 'pointer', fontSize: '18px', fontWeight: 800 }}>
                                {menuOpen ? '×' : '≡'}
                            </motion.button>
                        )}
                    </div>
                </nav>

                <AnimatePresence>
                    {isCompact && menuOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} style={{ margin: '10px 16px 0', padding: '18px', borderRadius: '24px', background: 'rgba(4, 8, 5, 0.94)', border: '1px solid rgba(126, 252, 141, 0.12)', boxShadow: '0 24px 50px rgba(0,0,0,0.32)', display: 'grid', gap: '10px' }}>
                            {links.map((link) => (
                                <motion.button key={link.hash} whileTap={{ scale: 0.98 }} onClick={() => goToSection(link.hash)} style={{ padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', color: '#d6ded7', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
                                    {link.label}
                                </motion.button>
                            ))}
                            <div style={{ paddingTop: '6px' }}>
                                <UserStatus compact />
                            </div>
                            <Link to="/studio" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                                <motion.div whileTap={{ scale: 0.98 }} style={{ padding: '15px 16px', borderRadius: '18px', border: '1px solid rgba(126, 252, 141, 0.18)', background: 'linear-gradient(135deg, rgba(57,255,20,0.18) 0%, rgba(12,34,19,0.92) 100%)', color: '#f6fff7', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center' }}>
                                    {text('Open 3D Studio', 'Открыть 3D Studio', '3D Studio ашу')}
                                </motion.div>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    const menuData = {
        men: {
            key: 'nav.men',
            sections: [
                { title: 'SHOES', items: ['Originals', 'Running', 'Football', 'Basketball', 'Slides'] },
                { title: 'CLOTHING', items: ['T-Shirts', 'Hoodies', 'Pants', 'Shorts', 'Jackets'] },
                { title: 'ACCESSORIES', items: ['Bags', 'Socks', 'Hats', 'Balls'] }
            ]
        },
        women: {
            key: 'nav.women',
            sections: [
                { title: 'SHOES', items: ['Originals', 'Running', 'Training', 'Slides'] },
                { title: 'CLOTHING', items: ['T-Shirts', 'Leggings', 'Sports Bras', 'Hoodies'] },
                { title: 'ACCESSORIES', items: ['Bags', 'Socks', 'Headbands'] }
            ]
        },
        kids: {
            key: 'nav.kids',
            sections: [
                { title: 'SHOES', items: ['Youth', 'Children', 'Toddler'] },
                { title: 'CLOTHING', items: ['Sets', 'T-Shirts', 'Pants'] }
            ]
        }
    };

    const handleMouseEnter = (menu: string) => setActiveMenu(menu);
    const handleMouseLeave = () => setActiveMenu(null);

    return (
        <motion.div
            onMouseLeave={handleMouseLeave}
            className="navbar-container"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            {/* Main Bar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 40px',
                height: '70px',
                background: 'rgba(5, 5, 5, 0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(57, 255, 20, 0.1)',
                position: 'relative',
                zIndex: 1001,
                boxShadow: '0 0 20px rgba(57,255,20,0.05), 0 1px 0 rgba(57,255,20,0.08)',
                animation: 'border-glow-pulse 4s ease-in-out infinite',
            }}>
                {/* Logo */}
                <motion.div
                    whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 12px rgba(57,255,20,0.6))' }}
                    whileTap={{ scale: 0.95 }}
                    style={{ cursor: 'pointer', position: 'relative' }}
                    onClick={() => navigate('/')}
                >
                    <svg viewBox="0 0 50 34" width="50" height="34" fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 6px rgba(57,255,20,0.4))' }}>
                        <path d="M12.9 24.3L4.1 24.3L15.3 5.7L24.1 5.7L12.9 24.3ZM26.8 24.3L18 24.3L29.2 5.7L38 5.7L26.8 24.3ZM40.7 24.3L31.9 24.3L43.1 5.7L51.9 5.7L40.7 24.3Z" transform="scale(0.6) translate(15,10)" />
                    </svg>
                </motion.div>

                {/* Navigation Links */}
                <div style={{ display: 'flex', height: '100%' }}>
                    {(['men', 'women', 'kids'] as const).map((key) => (
                        <div
                            key={key}
                            onMouseEnter={() => handleMouseEnter(key)}
                            style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 25px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '15px',
                                position: 'relative',
                                textTransform: 'uppercase',
                                color: activeMenu === key ? 'var(--primary)' : 'var(--text-main)',
                                letterSpacing: '0.15em',
                                fontFamily: 'var(--font-punk)',
                                textShadow: activeMenu === key ? '0 0 10px rgba(57,255,20,0.6), 0 0 20px rgba(57,255,20,0.3)' : 'none',
                                transition: 'color 0.2s, text-shadow 0.3s',
                            }}
                        >
                            {t(menuData[key].key)}
                            {activeMenu === key && (
                                <motion.div
                                    layoutId="underline"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '10%',
                                        right: '10%',
                                        height: '3px',
                                        background: 'var(--primary)',
                                        boxShadow: '0 0 12px var(--primary), 0 0 25px rgba(57,255,20,0.4)',
                                        borderRadius: '2px',
                                    }}
                                />
                            )}
                        </div>
                    ))}
                    <Link to="/studio" style={{ textDecoration: 'none' }}>
                        <motion.div
                            whileHover={{
                                color: '#39ff14',
                                textShadow: '0 0 10px rgba(57,255,20,0.7), 0 0 30px rgba(57,255,20,0.4)',
                            }}
                            style={{
                                display: 'flex',
                                height: '100%',
                                alignItems: 'center',
                                padding: '0 25px',
                                color: 'var(--primary)',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                fontSize: '15px',
                                letterSpacing: '0.15em',
                                fontFamily: 'var(--font-punk)',
                                textShadow: '0 0 6px rgba(57,255,20,0.3)',
                            }}
                        >
                            ⚡ {t('nav.studio')}
                        </motion.div>
                    </Link>
                </div>

                {/* Right — Nav items + Lang switcher */}
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', alignItems: 'center', color: 'var(--text-main)', fontFamily: 'var(--font-punk)', letterSpacing: '0.12em' }}>
                    <LanguageSwitcher />
                    <motion.span
                        whileHover={{ color: 'var(--primary)', textShadow: '0 0 8px rgba(57,255,20,0.5)' }}
                        style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    >{t('nav.explore')}</motion.span>
                    <UserStatus />
                    <Link to="/studio" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.span
                            whileHover={{ color: 'var(--primary)', textShadow: '0 0 8px rgba(57,255,20,0.5)' }}
                            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                        >
                            {t('nav.tryon')}
                        </motion.span>
                    </Link>
                </div>
            </nav>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
                {activeMenu && menuData[activeMenu as keyof typeof menuData] && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -20, scaleY: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        style={{
                            position: 'absolute',
                            top: '70px',
                            left: 0,
                            width: '100%',
                            background: 'rgba(5, 5, 5, 0.96)',
                            backdropFilter: 'blur(30px)',
                            borderBottom: '1px solid rgba(57,255,20,0.1)',
                            padding: '50px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '100px',
                            color: 'var(--text-main)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(57,255,20,0.05)',
                            transformOrigin: 'top',
                        }}
                    >
                        {/* Green glow orb */}
                        <div style={{
                            position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
                            width: '300px', height: '80px',
                            background: 'radial-gradient(ellipse, rgba(57,255,20,0.12) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        {menuData[activeMenu as keyof typeof menuData].sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                            >
                                <div style={{
                                    fontWeight: 500, marginBottom: '5px', fontSize: '16px',
                                    letterSpacing: '0.2em', color: 'var(--primary)',
                                    fontFamily: 'var(--font-punk)',
                                    textShadow: '0 0 8px rgba(57,255,20,0.3)',
                                }}>{t(sectionTitleKeys[section.title] || section.title)}</div>
                                {section.items.map(item => (
                                    <Link
                                        key={item}
                                        to="/studio"
                                        onClick={() => setActiveMenu(null)}
                                        style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '15px', transition: 'color 0.2s' }}
                                    >
                                        <motion.div
                                            whileHover={{ x: 8, color: '#39ff14', textShadow: '0 0 6px rgba(57,255,20,0.4)' }}
                                            style={{ fontFamily: 'var(--font-main)', fontWeight: 500 }}
                                        >
                                            {t(menuItemKeys[item] || item)}
                                        </motion.div>
                                    </Link>
                                ))}
                            </motion.div>
                        ))}

                        {/* Promo feature box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                width: '250px', height: '250px',
                                background: 'rgba(57,255,20,0.03)', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(57,255,20,0.1)',
                                position: 'relative', overflow: 'hidden',
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: '-20px', right: '-20px',
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'rgba(57,255,20,0.08)', filter: 'blur(20px)',
                            }} />
                            <span style={{
                                color: 'var(--primary)', fontWeight: 700,
                                fontFamily: 'var(--font-punk)', letterSpacing: '0.15em',
                                fontSize: '14px', textShadow: '0 0 8px rgba(57,255,20,0.3)',
                            }}>{t('nav.promo')}</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Language Switcher ───
function LanguageSwitcher() {
    const { lang, setLang } = useLangStore();
    const t = useT();
    const langs: Lang[] = ['en', 'ru', 'kz'];

    return (
        <div style={{
            display: 'flex',
            gap: '2px',
            background: 'rgba(57,255,20,0.05)',
            borderRadius: '6px',
            border: '1px solid rgba(57,255,20,0.1)',
            padding: '2px',
        }}>
            {langs.map((l) => (
                <motion.button
                    key={l}
                    onClick={() => setLang(l)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-punk)',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: lang === l ? 'var(--primary)' : 'transparent',
                        color: lang === l ? '#000' : 'var(--text-muted)',
                        boxShadow: lang === l ? '0 0 10px rgba(57,255,20,0.3)' : 'none',
                    }}
                >
                    {t(`lang.${l}`)}
                </motion.button>
            ))}
        </div>
    );
}

// ─── User Status ───
function UserStatus({ compact = false }: { compact?: boolean }) {
    const { user } = useOutfitStore();
    const t = useT();

    if (user) {
        return <Link to="/profile" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 'bold' }}>
            <motion.div
                whileHover={{ color: 'var(--primary)', textShadow: '0 0 8px rgba(57,255,20,0.5)' }}
                style={{
                    padding: compact ? '14px 16px' : 0,
                    borderRadius: compact ? '18px' : 0,
                    border: compact ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: compact ? 'rgba(255,255,255,0.02)' : 'transparent',
                    color: compact ? '#dce5de' : undefined,
                }}
            >
                👤 {user.name.toUpperCase()}
            </motion.div>
        </Link>;
    }

    return <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
        <motion.div
            whileHover={{ color: 'var(--primary)', textShadow: '0 0 8px rgba(57,255,20,0.5)' }}
            style={{
                padding: compact ? '14px 16px' : 0,
                borderRadius: compact ? '18px' : 0,
                border: compact ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: compact ? 'rgba(255,255,255,0.02)' : 'transparent',
                color: compact ? '#dce5de' : undefined,
            }}
        >
            {t('nav.login')}
        </motion.div>
    </Link>;
}
