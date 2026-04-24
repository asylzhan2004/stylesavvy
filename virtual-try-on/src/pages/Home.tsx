import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PromoCarousel } from '../components/PromoCarousel';
import { useRef, useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { useT, useLangStore } from '../i18n/store';

const LazyGarmentShowcaseCanvas = lazy(() =>
    import('../components/GarmentShowcaseCanvas').then(m => ({ default: m.GarmentShowcaseCanvas }))
);

function useInView(ref: React.RefObject<HTMLElement | null>, rootMargin = '200px') {
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); } },
            { rootMargin }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref, rootMargin]);
    return isInView;
}

// Typewriter hook
function useTypewriter(words: string[], typingSpeed = 100, deletingSpeed = 60, pauseDuration = 2000) {
    const [displayText, setDisplayText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);
        return () => clearInterval(cursorInterval);
    }, []);

    const tick = useCallback(() => {
        const currentWord = words[wordIndex];
        if (!isDeleting) {
            setDisplayText(currentWord.substring(0, displayText.length + 1));
            if (displayText.length === currentWord.length) {
                setTimeout(() => setIsDeleting(true), pauseDuration);
                return;
            }
        } else {
            setDisplayText(currentWord.substring(0, displayText.length - 1));
            if (displayText.length === 0) {
                setIsDeleting(false);
                setWordIndex((prev) => (prev + 1) % words.length);
                return;
            }
        }
    }, [displayText, isDeleting, wordIndex, words, pauseDuration]);

    useEffect(() => {
        const speed = isDeleting ? deletingSpeed : typingSpeed;
        const timer = setTimeout(tick, speed);
        return () => clearTimeout(timer);
    }, [tick, isDeleting, typingSpeed, deletingSpeed]);

    return { displayText, showCursor };
}

// ── Green Glow Orb Component — мемоизируем, добавляем will-change ──
const GlowOrb = memo(function GlowOrb({ x, y, size, delay, intensity = 1 }: { x: string; y: string; size: number; delay: number; intensity?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 0.28 * intensity, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.5, delay, ease: 'easeOut' }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(57,255,20,0.3) 0%, rgba(57,255,20,0.06) 45%, transparent 70%)',
                filter: `blur(${Math.round(size * 0.25)}px)`,
                pointerEvents: 'none',
                willChange: 'opacity',
            }}
        />
    );
});

// ── SVG Ink filter for text ──
function InkFilter() {
    return (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
                <filter id="ink-filter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </defs>
        </svg>
    );
}

// ── Floating Particles (мемоизировано — random только 1 раз) ──
const FloatingParticles = memo(function FloatingParticles() {
    const particles = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => ({
            id: i,
            x: `${(i * 10 + 5) % 100}%`,
            size: 2 + (i % 3),
            duration: 10 + (i % 5) * 2,
            delay: (i * 0.7) % 5,
            opacity: 0.2 + (i % 4) * 0.07,
            yDistance: -(550 + (i % 3) * 120),
            xDrift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 15),
        })),
    []);

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        bottom: '-10px',
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        background: '#39ff14',
                        boxShadow: '0 0 4px #39ff14',
                        willChange: 'transform, opacity',
                    }}
                    animate={{
                        y: [0, p.yDistance],
                        opacity: [0, p.opacity, p.opacity, 0],
                        x: [0, p.xDrift],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
});

// ── Video Hero — плавная ленивая загрузка ──
const HeroVideo = memo(function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [videoOpacity, setVideoOpacity] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Загружаем видео только когда браузер не занят (после первого рендера)
        const loadVideo = () => {
            video.load(); // начинаем загрузку (preload="none" → теперь грузим)

            const handleCanPlay = () => {
                video.play().catch(() => {});
                // Плавный fade-in через CSS transition
                requestAnimationFrame(() => setVideoOpacity(1));
            };

            // Повтор с паузой 15 сек
            const handleEnded = () => {
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                    }
                }, 15000);
            };

            video.addEventListener('canplaythrough', handleCanPlay, { once: true });
            video.addEventListener('ended', handleEnded);

            return () => {
                video.removeEventListener('canplaythrough', handleCanPlay);
                video.removeEventListener('ended', handleEnded);
            };
        };

        // requestIdleCallback — запускаем после того как браузер прогрузил страницу
        if ('requestIdleCallback' in window) {
            const id = requestIdleCallback(loadVideo, { timeout: 2000 });
            return () => cancelIdleCallback(id);
        } else {
            // Fallback для Safari
            const t = setTimeout(loadVideo, 1000);
            return () => clearTimeout(t);
        }
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: '90px clamp(20px, 4vw, 54px) 60px',
            borderRadius: '36px',
            overflow: 'hidden',
            border: '1px solid rgba(126, 252, 141, 0.18)',
            boxShadow: '0 40px 120px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(57,255,20,0.06)',
        }}>
            {/* Base dark bg — всегда видна, видео поверх */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(4, 12, 7, 0.95) 0%, rgba(3, 7, 5, 0.98) 100%)',
            }} />

            {/* Grid overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(126,252,141,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(126,252,141,0.05) 1px, transparent 1px)',
                backgroundSize: '72px 72px',
                opacity: 0.4,
                zIndex: 1,
            }} />

            {/* Video — CSS transition, без Framer Motion */}
            <video
                ref={videoRef}
                muted
                playsInline
                preload="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 2,
                    opacity: videoOpacity,
                    transition: 'opacity 1.2s ease',
                    willChange: 'opacity',
                }}
            >
                <source src="/videof/Анимация_fr.mp4" type="video/mp4" />
            </video>

            {/* Color-grading overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(3,8,5,0.28) 0%, transparent 30%, transparent 70%, rgba(3,8,5,0.55) 100%)',
                zIndex: 3,
                pointerEvents: 'none',
            }} />

            {/* Bottom glow */}
            <div style={{
                position: 'absolute', left: '12%', right: '12%', bottom: '8%',
                height: '24%', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(57,255,20,0.18) 0%, rgba(57,255,20,0.02) 54%, transparent 72%)',
                filter: 'blur(32px)', zIndex: 4,
            }} />

            {/* Badge — CSS animation delay */}
            <div
                style={{
                    position: 'absolute', left: 24, bottom: 24, zIndex: 5,
                    padding: '10px 16px', borderRadius: '999px',
                    border: '1px solid rgba(126, 252, 141, 0.16)',
                    background: 'rgba(4, 9, 6, 0.82)',
                    backdropFilter: 'blur(12px)',
                    color: '#8fb39a', fontSize: 11,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: 0,
                    animation: 'fade-slide-up 0.6s ease 1.2s forwards',
                }}
            >
                <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#39ff14',
                    boxShadow: '0 0 8px #39ff14',
                    display: 'inline-block',
                    animation: 'glow-pulse 2s ease-in-out infinite',
                }} />
                3D Fashion Studio · Live Preview
            </div>

            <FloatingParticles />
        </div>
    );
});

// ── Rotating Facts Aside ──
const clothingGroupFacts = [
    {
        tag: 'Верхняя часть',
        tagEn: 'Tops',
        tagKz: 'Жоғарғы бөлік',
        accent: '#7efc8d',
        icon: '👕',
        facts: [
            { ru: 'Футболки и базовые топы — самые универсальные вещи гардероба', en: 'T-shirts and basic tops are the most versatile wardrobe items', kz: 'Футболкалар мен базалық топтар — гардероптың ең әмбебап заттары' },
            { ru: 'Правильный силуэт топа определяет весь образ на 60%', en: 'The correct top silhouette defines 60% of the entire outfit', kz: 'Дұрыс топ силуэті бүкіл образды 60% анықтайды' },
            { ru: 'Оверсайз футболки создают объём и баланс нижней части', en: 'Oversized tees create volume and balance the lower half', kz: 'Оверсайз футболкалар көлем жасап, астыңғы бөлікке тепе-теңдік береді' },
            { ru: 'Принт на топе читается лучше всего при оверсайз крое', en: 'Print on a top reads best with an oversized cut', kz: 'Топтағы принт оверсайз кроймен жақсы оқылады' },
        ]
    },
    {
        tag: 'Нижняя часть',
        tagEn: 'Bottoms',
        tagKz: 'Төменгі бөлік',
        accent: '#8ec5ff',
        icon: '👖',
        facts: [
            { ru: 'Джинсы — самый продаваемый тип одежды в мире уже 150 лет', en: 'Jeans are the most sold clothing item in the world for 150 years', kz: 'Джинсылар 150 жыл бойы дүниежүзінде ең көп сатылатын киім' },
            { ru: 'Длина штанин влияет на визуальную высоту фигуры', en: 'Trouser length affects the visual height of your figure', kz: 'Шалбар ұзындығы фигураның көрнекі биіктігіне әсер етеді' },
            { ru: 'Wide-leg брюки визуально удлиняют ноги при высокой посадке', en: 'Wide-leg pants visually elongate legs with a high waist', kz: 'Wide-leg шалбар жоғары белмен аяқтарды визуалды ұзартады' },
            { ru: 'Цвет низа задаёт основной тон всего образа', en: 'Bottom color sets the main tone of the entire outfit', kz: 'Астыңғының түсі бүкіл образдың негізгі тонын белгілейді' },
        ]
    },
    {
        tag: 'Верхняя одежда',
        tagEn: 'Outerwear',
        tagKz: 'Сыртқы киім',
        accent: '#ffe48a',
        icon: '🧥',
        facts: [
            { ru: 'Куртка — последний слой, который завершает целостность образа', en: 'A jacket is the final layer that completes the outfit', kz: 'Куртка — образдың тұтастығын аяқтайтын соңғы қабат' },
            { ru: 'Объём верхней одежды должен соответствовать пропорциям низа', en: 'Outerwear volume should match the proportions of the bottom', kz: 'Сыртқы киім көлемі астыңғы бөліктің пропорциясына сай болуы керек' },
            { ru: 'Бомберы и тренчи универсальны для любого сезона', en: 'Bombers and trenches are versatile for any season', kz: 'Бомберлер мен тренчтар кез-келген маусымға жарайды' },
            { ru: 'Структурный жакет добавляет формальность любому луку', en: 'A structured jacket adds formality to any look', kz: 'Структуралы жакет кез-келген образға формальдылық қосады' },
        ]
    },
    {
        tag: 'Платья',
        tagEn: 'Dresses',
        tagKz: 'Көйлектер',
        accent: '#ff9de2',
        icon: '👗',
        facts: [
            { ru: 'Платье — единственная вещь, формирующая полный силуэт сразу', en: 'A dress is the only item that shapes a complete silhouette at once', kz: 'Көйлек — силуэтті бірден толық қалыптастыратын жалғыз зат' },
            { ru: 'Силуэт A-line подходит любому типу телосложения', en: 'A-line silhouette suits every body type', kz: 'A-line силуэт кез-келген дене пішіне жарайды' },
            { ru: 'Длина миди — самый трендовый выбор последних 5 лет', en: 'Midi length is the most trendy choice for the last 5 years', kz: 'Миди ұзындығы соңғы 5 жылдың ең трендті таңдауы' },
            { ru: 'Задрапированные детали создают визуальную динамику образа', en: 'Draped details create visual dynamics in an outfit', kz: 'Дрейпирленген детальдер образда визуалды динамика жасайды' },
        ]
    },
    {
        tag: 'Белая одежда',
        tagEn: 'Base Layer',
        tagKz: 'Базалық қабат',
        accent: '#c8cfff',
        icon: '🩱',
        facts: [
            { ru: 'Базовый слой — основа многослойных образов и спортивного стиля', en: 'Base layer is the foundation of layered looks and sports style', kz: 'Базалық қабат — қабатты образдар мен спорт стилінің негізі' },
            { ru: 'Правильная посадка базы определяет комфорт всего ансамбля', en: 'The correct fit of the base defines the comfort of the entire ensemble', kz: 'Базаның дұрыс отырысы бүкіл ансамбльдің ыңғайлылығын анықтайды' },
            { ru: 'Нейтральные цвета базы позволяют комбинировать неограниченно', en: 'Neutral base colors allow unlimited combinations', kz: 'Базаның бейтарап түстері шексіз комбинацияларға мүмкіндік береді' },
            { ru: '70% образов из уличной моды начинаются с базового кроя', en: '70% of streetwear outfits start with a basic silhouette', kz: 'Уличті моданың 70% образдары базалық кроймен басталады' },
        ]
    },
];

function RotatingFactsAside({ lang }: { lang: string }) {
    const [groupIdx, setGroupIdx] = useState(0);
    const [factIdx, setFactIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const INTERVAL = 5000;
        const FADE = 350;
        let start: number | null = null;
        let animFrame: number;

        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
            if (elapsed < INTERVAL) {
                animFrame = requestAnimationFrame(step);
            }
        };
        animFrame = requestAnimationFrame(step);

        const timer = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setGroupIdx(prev => {
                    const nextGroup = (prev + 1) % clothingGroupFacts.length;
                    setFactIdx(fi => (fi + 1) % clothingGroupFacts[nextGroup].facts.length);
                    return nextGroup;
                });
                setProgress(0);
                start = null;
                animFrame = requestAnimationFrame(step);
                setVisible(true);
            }, FADE);
        }, INTERVAL);

        return () => {
            clearInterval(timer);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    const group = clothingGroupFacts[groupIdx];
    const fact = group.facts[factIdx];
    const isRu = lang === 'ru';
    const isKz = lang === 'kz';
    const factText = isRu ? fact.ru : isKz ? fact.kz : fact.en;
    const tagText = isRu ? group.tag : isKz ? group.tagKz : group.tagEn;

    return (
        <motion.aside
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{ borderRadius: 32, padding: 'clamp(24px, 3vw, 36px)', background: 'linear-gradient(180deg, rgba(15, 34, 23, 0.94) 0%, rgba(5, 10, 7, 0.98) 100%)', border: `1px solid ${group.accent}28`, display: 'grid', alignContent: 'start', gap: 20, position: 'relative', overflow: 'hidden' }}
        >
            {/* Animated top accent glow */}
            <motion.div
                key={groupIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ position: 'absolute', right: '-20%', top: '-20%', width: '280px', height: '280px', borderRadius: '50%', background: `radial-gradient(circle, ${group.accent}22 0%, transparent 70%)`, pointerEvents: 'none' }}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: '999px', background: `${group.accent}18`, border: `1px solid ${group.accent}30`, color: group.accent, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
                    <span style={{ fontSize: 16 }}>{group.icon}</span>
                    {tagText}
                </div>
                {/* Group dots navigation */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {clothingGroupFacts.map((g, i) => (
                        <button
                            key={i}
                            onClick={() => { setVisible(false); setTimeout(() => { setGroupIdx(i); setFactIdx(0); setProgress(0); setVisible(true); }, 200); }}
                            style={{ width: i === groupIdx ? 20 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === groupIdx ? g.accent : 'rgba(255,255,255,0.15)', transition: 'all 0.35s ease', padding: 0 }}
                        />
                    ))}
                </div>
            </div>

            {/* Label */}
            <p style={{ color: `${group.accent}99`, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
                {isRu ? 'Факт о группе' : isKz ? 'Топ туралы факт' : 'Group fact'}
            </p>

            {/* Animated fact text */}
            <div style={{ minHeight: 120, display: 'flex', alignItems: 'flex-start' }}>
                <motion.p
                    key={`${groupIdx}-${factIdx}`}
                    initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                    animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -10, filter: visible ? 'blur(0px)' : 'blur(6px)' }}
                    transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
                    style={{ color: '#d8eede', fontSize: 'clamp(17px, 2.8vw, 22px)', lineHeight: 1.6, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}
                >
                    &ldquo;{factText}&rdquo;
                </motion.p>
            </div>

            {/* Progress bar */}
            <div style={{ position: 'relative', height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <motion.div
                    key={`progress-${groupIdx}-${factIdx}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                    style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${group.accent}88, ${group.accent})`, boxShadow: `0 0 8px ${group.accent}66` }}
                />
            </div>

            {/* Fact counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: '0.15em' }}>
                    {groupIdx + 1} / {clothingGroupFacts.length} {isRu ? 'группа' : isKz ? 'топ' : 'group'}
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                    {group.facts.map((_, i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === factIdx ? group.accent : 'rgba(255,255,255,0.18)', transition: 'all 0.3s', boxShadow: i === factIdx ? `0 0 6px ${group.accent}` : 'none' }} />
                    ))}
                </div>
            </div>

            {/* Animated icon in corner */}
            <motion.div
                key={`icon-${groupIdx}`}
                initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                animate={{ opacity: 0.08, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                style={{ position: 'absolute', bottom: 20, right: 24, fontSize: 90, pointerEvents: 'none', userSelect: 'none' }}
            >
                {group.icon}
            </motion.div>
        </motion.aside>
    );
}

// ── Animated stat card ──
const StatCard = memo(function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.04, borderColor: 'rgba(57,255,20,0.22)' }}
            style={{
                padding: '20px 22px', borderRadius: 22,
                background: 'rgba(6, 12, 8, 0.82)',
                border: '1px solid rgba(126, 252, 141, 0.1)',
                backdropFilter: 'blur(12px)',
                transition: 'border-color 0.3s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(57,255,20,0.03) 0%, transparent 60%)',
                pointerEvents: 'none',
            }} />
            <div style={{ fontSize: 30, fontWeight: 700, color: '#d9ffe0', fontFamily: 'var(--font-display)', letterSpacing: '0.01em', lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#7fa495', fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>{label}</div>
        </motion.div>
    );
});

// ── Shimmer divider ──
const ShimmerDivider = memo(function ShimmerDivider() {
    return (
        <div style={{ position: 'relative', height: 2, margin: '0 clamp(20px, 5vw, 72px)' }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.3), rgba(57,255,20,0.6), rgba(57,255,20,0.3), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer-line 3s ease-in-out infinite',
            }} />
        </div>
    );
});

function Lazy3DCard({ modelPath, accent, modelScale, modelRotation, modelPosition }: {
    modelPath: string; accent: string; modelScale?: number;
    modelRotation?: [number, number, number]; modelPosition?: [number, number, number];
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const isVisible = useInView(cardRef);
    return (
        <div ref={cardRef} style={{ position: 'absolute', inset: 0 }}>
            {isVisible && (
                <Suspense fallback={
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9cb29f', fontSize: 12, letterSpacing: '0.16em' }}>Loading 3D...</div>
                }>
                    <LazyGarmentShowcaseCanvas modelPath={modelPath} accent={accent} modelScale={modelScale} modelRotation={modelRotation} modelPosition={modelPosition} />
                </Suspense>
            )}
        </div>
    );
}

export function Home() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.35, 0.7, 1],
        ['#060805', '#08110a', '#07140c', '#050705']
    );
    const lang = useLangStore((state) => state.lang);
    const studioFirstHome = typeof window !== 'undefined';

    if (studioFirstHome) {
        const isRu = lang === 'ru';
        const isKz = lang === 'kz';
        const text = (en: string, ru: string, kz: string) => (isRu ? ru : isKz ? kz : en);
        const stats = [
            { value: '360°', label: text('garment preview in motion', 'обзор одежды в движении', 'киімді айналдырып қарау') },
            { value: '5', label: text('ready clothing groups', 'готовые группы одежды', 'дайын киім топтары') },
            { value: 'Custom', label: text('graphics, colors and ideas', 'свои дизайны, цвета и графика', 'өз түсі, графикасы және идеясы') },
            { value: 'Studio', label: text('main focus of the flow', 'главный центр всей работы', 'жұмыс ағынының орталығы') },
        ];
        const cards = [
            {
                id: 'tops',
                tag: text('Upper part', 'Верхняя часть', 'Жоғарғы бөлік'),
                title: text('Base tops for prints, color and silhouette work', 'База для футболок, джемперов и лёгких верхов', 'Футболка, джемпер және жеңіл үстіңгі базасы'),
                description: text('This block is useful for logos, graphics and quick checks of the main outfit silhouette.', 'Этот блок удобен для логотипов, графики и быстрой проверки основной формы образа.', 'Бұл блок логотип, графика және негізгі силуэтті жылдам тексеру үшін ыңғайлы.'),
                bullets: [
                    text('Uses the same 3D model library as the studio', 'Использует ту же библиотеку моделей, что и студия', 'Студиядағы сол модельдер кітапханасын қолданады'),
                    text('Works well for front-facing design ideas', 'Подходит для принтов и фронтальных решений', 'Принт пен алдыңғы дизайнға жақсы келеді'),
                ],
                modelPath: '/models/men/tops/Kyim8blend.glb',
                accent: '#7efc8d',
                gradient: 'linear-gradient(135deg, rgba(19, 52, 35, 0.9) 0%, rgba(7, 18, 12, 0.98) 100%)',
                modelScale: 1.08,
                modelRotation: [0.05, -0.25, 0] as [number, number, number],
            },
            {
                id: 'bottoms',
                tag: text('Lower part', 'Нижняя часть', 'Төменгі бөлік'),
                title: text('Bottom silhouettes for jeans, pants and balance', 'Низ для джинсов, брюк и общей пропорции образа', 'Джинсы мен шалбар арқылы образ тепе-теңдігін көру'),
                description: text('Compare length, volume and proportion without any price blocks or product selling details.', 'Оценивайте длину, объём и баланс без цен и магазинных карточек.', 'Ұзындық, көлем және тепе-теңдікті баға мен дүкен карточкаларынсыз бағалаңыз.'),
                bullets: [
                    text('Prepared for quick 3D viewing', 'Готово для быстрого 3D-просмотра', 'Жылдам 3D қарауға дайын'),
                    text('Useful for pairing with tops and outerwear', 'Удобно сочетать с верхней частью и верхней одеждой', 'Жоғарғы бөлік және сыртқы киіммен үйлестіруге ыңғайлы'),
                ],
                modelPath: '/models/men/bottoms/jeansblend2.glb',
                accent: '#8ec5ff',
                gradient: 'linear-gradient(135deg, rgba(14, 35, 39, 0.92) 0%, rgba(6, 15, 18, 0.98) 100%)',
                modelScale: 0.9,
                modelRotation: [0.04, 0.1, 0] as [number, number, number],
            },
            {
                id: 'outerwear',
                tag: text('Outerwear', 'Верхняя одежда', 'Сыртқы киім'),
                title: text('Jackets and layers for the final silhouette', 'Куртки и внешние слои для финального силуэта', 'Куртка және сыртқы қабаттар үшін финал силуэті'),
                description: text('Outerwear adds structure to the outfit, so this block focuses on volume, shape and reading the look in 3D.', 'Верхняя одежда задаёт характер образа, поэтому здесь важны объём, форма и чтение вещи в 3D.', 'Сыртқы киім образдың мінезін береді, сондықтан мұнда көлем, пішін және 3D көрініс маңызды.'),
                bullets: [
                    text('Great for layered looks', 'Подходит для многослойных образов', 'Көпқабатты образдарға жақсы келеді'),
                    text('Keeps the focus on studio-ready garment form', 'Сохраняет акцент на студийной форме вещи', 'Назарды студияға дайын пішінде ұстайды'),
                ],
                modelPath: '/models/men/outerwear/Jacket2.glb',
                accent: '#ffe48a',
                gradient: 'linear-gradient(135deg, rgba(43, 42, 17, 0.9) 0%, rgba(14, 14, 8, 0.98) 100%)',
                modelScale: 0.82,
                modelPosition: [0.15, -1.3, 0] as [number, number, number],
                modelRotation: [0.06, -0.18, 0] as [number, number, number],
            },
            {
                id: 'dresses',
                tag: text('Dresses', 'Платья', 'Көйлектер'),
                title: text('Dresses that shape a complete silhouette at once', 'Платья, создающие завершённый силуэт с первого взгляда', 'Бір қарауда толық силуэт беретін көйлектер'),
                description: text('Dresses are the only garment that defines the full look on their own — length, drape and shape all in one piece.', 'Платье — единственная вещь, которая сама задаёт полный образ: длина, драпировка и форма в одном изделии.', 'Көйлек — ұзындығы, драпировкасы және пішіні бір бөлікте толық образды өзі анықтайтын жалғыз зат.'),
                bullets: [
                    text('Perfect for checking full-length silhouette balance', 'Идеально для проверки баланса полного силуэта', 'Толық силуэт тепе-теңдігін тексеруге тамаша'),
                    text('Works across formal and casual 3D styling', 'Подходит как для формального, так и для повседневного стиля', 'Формальды да, күнделікті стильге де жарайды'),
                ],
                modelPath: '/models/women/dresses/dressgirl.glb',
                accent: '#ff9de2',
                gradient: 'linear-gradient(135deg, rgba(52, 14, 40, 0.9) 0%, rgba(18, 7, 14, 0.98) 100%)',
                modelScale: 0.88,
                modelPosition: [0.1, -0.8, 0] as [number, number, number],
                modelRotation: [0.04, 0.12, 0] as [number, number, number],
            },
            {
                id: 'baselayer',
                tag: text('Base Layer', 'Белая одежда', 'Базалық қабат'),
                title: text('Base layer pieces for layered outfits and sports looks', 'Базовые вещи для многослойных образов и спортивного стиля', 'Қабатты образдар мен спорт стилі үшін базалық заттар'),
                description: text('The foundation of any layered outfit. Base garments focus on fit, proportion and comfort within the 3D space.', 'Основа любого многослойного образа. Базовые вещи сосредоточены на посадке, пропорциях и комфорте в 3D-пространстве.', 'Кез-келген қабатты образдың негізі. Базалық заттар 3D кеңістіктегі отырыс, пропорция және ыңғайлылыққа бағытталған.'),
                bullets: [
                    text('Neutral and flexible for any combination', 'Нейтральные и гибкие для любой комбинации', 'Кез-келген комбинацияға бейтарап және икемді'),
                    text('Great starting point before adding outerwear', 'Отличная отправная точка перед добавлением верхней одежды', 'Сыртқы киімді қоспас бұрын тамаша бастапқы нүкте'),
                ],
                modelPath: '/models/men/tops/Bezrukavka.glb',
                accent: '#c8cfff',
                gradient: 'linear-gradient(135deg, rgba(18, 18, 46, 0.9) 0%, rgba(7, 7, 18, 0.98) 100%)',
                modelScale: 1.05,
                modelRotation: [0.05, -0.2, 0] as [number, number, number],
            },
        ];
        const steps = [
            {
                title: text('Choose a garment group', 'Выберите группу одежды', 'Киім тобын таңдаңыз'),
                description: text('Start from the clothing part that sets the silhouette.', 'Начните с той части одежды, которая задаёт силуэт.', 'Алдымен силуэтті беретін киім бөлігін таңдаңыз.'),
            },
            {
                title: text('Move into 3D Design Studio', 'Перейдите в 3D Design Studio', '3D Design Studio-ға өтіңіз'),
                description: text('The studio stays the main place for camera control and detailed edits.', 'Студия остаётся главным местом для камеры и детальной настройки.', 'Студия камераны және нақты өңдеуді басқарудың негізгі орны болып қалады.'),
            },
            {
                title: text('Build your own clothing design', 'Создайте свой дизайн одежды', 'Өз киім дизайныңызды жасаңыз'),
                description: text('Add color, graphics and composition directly around the garment.', 'Добавляйте цвет, графику и композицию прямо вокруг модели одежды.', 'Түс, графика және композицияны модельдің айналасында құрастырыңыз.'),
            },
        ];

        return (
            <motion.div ref={containerRef} style={{ background: backgroundColor, color: '#ffffff', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
                <InkFilter />
                <GlowOrb x="-8%" y="180px" size={320} delay={0.1} />
                <GlowOrb x="76%" y="120px" size={240} delay={0.3} />
                <GlowOrb x="62%" y="920px" size={320} delay={0.4} />

                {/* ── HERO with VIDEO ── */}
                <section id="overview" style={{ position: 'relative', minHeight: '100vh', padding: '110px clamp(20px, 5vw, 72px) 90px', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollMarginTop: '110px' }}>
                    <HeroVideo />

                    <div style={{ position: 'relative', zIndex: 2, width: 'min(100%, 1080px)', display: 'grid', gap: 32, justifyItems: 'center', textAlign: 'center' }}>
                        <motion.p
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            style={{ color: '#9bc5a2', letterSpacing: '0.32em', textTransform: 'uppercase', fontSize: 13, fontWeight: 700 }}
                        >
                            {text('Online try-on and clothing design', 'Онлайн-примерка и дизайн одежды', 'Онлайн киіп көру және киім дизайны')}
                        </motion.p>

                        <motion.h1
                            className="ink-text"
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            style={{ fontSize: 'clamp(68px, 12vw, 152px)', lineHeight: 0.94, margin: 0, fontWeight: 600, letterSpacing: '-0.04em', textTransform: 'none', fontFamily: 'var(--font-display)' }}
                        >
                            Style Savvy
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.55 }}
                            style={{ width: 'min(100%, 760px)', color: '#d0d8d2', fontSize: 'clamp(16px, 2.1vw, 20px)', lineHeight: 1.75 }}
                        >
                            {text('A 3D-first clothing platform where users build their own outfit ideas, inspect garments from every angle and move directly into the design studio.', 'Платформа с упором на 3D-примерку, где пользователи собирают свои дизайны одежды, смотрят силуэт со всех сторон и переходят прямо в 3D Design Studio.', 'Платформа 3D киіп көруге бағытталған: пайдаланушылар өз киім дизайнын жинап, силуэтті толық қарап, тікелей 3D Design Studio-ға өте алады.')}
                        </motion.p>

                        <motion.div
                            className="hero-cta-row"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.7 }}
                            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}
                        >
                            <motion.button
                                whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(57,255,20,0.22)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/studio')}
                                style={{ padding: '16px 32px', borderRadius: '999px', border: '1px solid rgba(126, 252, 141, 0.28)', background: 'linear-gradient(135deg, rgba(57,255,20,0.22) 0%, rgba(25,76,40,0.85) 100%)', color: '#f3fff4', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s', backdropFilter: 'blur(8px)' }}
                            >
                                {text('Open 3D Design Studio', 'Открыть 3D Design Studio', '3D Design Studio ашу')}
                            </motion.button>
                            <motion.button
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                style={{ padding: '16px 32px', borderRadius: '999px', border: '1px solid rgba(126, 252, 141, 0.16)', background: 'rgba(4, 9, 6, 0.78)', color: '#dfe8e1', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.3s' }}
                            >
                                {text('Explore clothing groups', 'Смотреть группы одежды', 'Киім топтарын көру')}
                            </motion.button>
                        </motion.div>

                        <div className="stats-grid" style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                            {stats.map((item, i) => (
                                <StatCard key={item.label} value={item.value} label={item.label} index={i} />
                            ))}
                        </div>
                    </div>
                </section>

                <ShimmerDivider />

                {/* ── CATEGORIES ── */}
                <section id="categories" style={{ padding: '80px clamp(20px, 5vw, 72px) 120px', scrollMarginTop: '110px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        style={{ maxWidth: 860, marginBottom: 48 }}
                    >
                        <p style={{ color: '#99c4a2', letterSpacing: '0.28em', textTransform: 'uppercase', fontSize: 12, fontWeight: 800, marginBottom: 14 }}>
                            {text('Clothing groups', 'Группы одежды', 'Киім топтары')}
                        </p>
                            <h2 style={{ fontSize: 'clamp(38px, 7vw, 68px)', lineHeight: 1.04, marginBottom: 16, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'none', letterSpacing: '-0.03em' }}>
                            {text('Built around garments, not checkout', 'Главная теперь про одежду и 3D-примерку', 'Басты бет енді киім мен 3D киіп көруге бағытталған')}
                        </h2>
                        <p style={{ color: '#b4beb7', fontSize: 17, lineHeight: 1.8 }}>
                            {text('Only groups with matching 3D models from the studio are shown here. The page stays focused on silhouette, fitting and design.', 'Здесь показаны только те группы, для которых уже есть 3D-модели из студии. Акцент остаётся на силуэте, посадке и дизайне.', 'Мұнда тек студияда дайын 3D модельдері бар топтар көрсетіледі. Екпін силуэтке, пішінге және дизайнға берілген.')}
                        </p>
                    </motion.div>
                    <div style={{ display: 'grid', gap: 28 }}>
                        {cards.map((card, cardIdx) => (
                            <motion.article
                                key={card.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.7, delay: cardIdx * 0.1 }}
                                whileHover={{ scale: 1.008, boxShadow: `0 36px 80px rgba(0,0,0,0.46), 0 0 0 1px ${card.accent}22` }}
                                style={{ borderRadius: 34, overflow: 'hidden', background: card.gradient, border: '1px solid rgba(126, 252, 141, 0.08)', boxShadow: '0 32px 70px rgba(0, 0, 0, 0.34)', transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}
                            >
                                <div className="category-card-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'stretch' }}>
                                    <div className="category-canvas-area" style={{ position: 'relative', minHeight: 340, background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 62%)' }}>
                                        <div style={{ position: 'absolute', left: '18%', right: '18%', bottom: '14%', height: '16%', borderRadius: '50%', background: `radial-gradient(circle, ${card.accent}66 0%, transparent 72%)`, filter: 'blur(24px)' }} />
                                        <Lazy3DCard modelPath={card.modelPath} accent={card.accent} modelScale={card.modelScale} modelRotation={card.modelRotation} modelPosition={card.modelPosition as [number, number, number]} />
                                    </div>
                                    <div style={{ padding: 'clamp(26px, 4vw, 40px)', display: 'grid', alignContent: 'center', gap: 18, background: 'linear-gradient(180deg, rgba(4, 9, 6, 0.14) 0%, rgba(4, 9, 6, 0.32) 100%)' }}>
                                        <div style={{ display: 'inline-flex', width: 'fit-content', padding: '9px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#dfffe6', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>{card.tag}</div>
                                <h3 style={{ margin: 0, fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.05, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'none', letterSpacing: '-0.02em' }}>{card.title}</h3>
                                        <p style={{ color: '#cfd6d0', fontSize: 16, lineHeight: 1.8 }}>{card.description}</p>
                                        <div style={{ display: 'grid', gap: 10 }}>
                                            {card.bullets.map((bullet) => (
                                                <div key={bullet} style={{ display: 'flex', gap: 12, color: '#9eb7a5', lineHeight: 1.6, fontSize: 14 }}>
                                                    <span style={{ color: card.accent, fontWeight: 900 }}>+</span>
                                                    <span>{bullet}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <motion.button
                                            whileHover={{ x: 5, boxShadow: `0 0 20px ${card.accent}33` }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => navigate('/studio')}
                                            style={{ width: 'fit-content', marginTop: 8, padding: '14px 24px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(4, 9, 6, 0.72)', color: '#f5fff6', cursor: 'pointer', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.3s' }}
                                        >
                                            {text('Open in 3D Studio', 'Открыть в 3D Studio', '3D Studio-да ашу')}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>

                <ShimmerDivider />

                {/* ── FACTS / WORKFLOW ── */}
                <section id="facts" style={{ padding: '80px clamp(20px, 5vw, 72px) 110px', scrollMarginTop: '110px' }}>
                    <div className="facts-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)', gap: 28 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.7 }}
                            style={{ borderRadius: 32, padding: 'clamp(26px, 4vw, 42px)', background: 'linear-gradient(180deg, rgba(9, 16, 11, 0.92) 0%, rgba(4, 8, 5, 0.96) 100%)', border: '1px solid rgba(126, 252, 141, 0.08)' }}
                        >
                            <p style={{ color: '#99c4a2', letterSpacing: '0.28em', textTransform: 'uppercase', fontSize: 12, fontWeight: 800, marginBottom: 14 }}>
                                {text('3D workflow', '3D-поток работы', '3D жұмыс ағыны')}
                            </p>
                            <h2 style={{ fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1.06, marginBottom: 26, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'none', letterSpacing: '-0.03em' }}>
                                {text('One clear path from idea to virtual fitting', 'Понятный путь от идеи до виртуальной примерки', 'Идеядан виртуалды киіп көруге дейінгі нақты жол')}
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                {steps.map((item, index) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.12, duration: 0.55 }}
                                        whileHover={{ borderColor: 'rgba(57,255,20,0.18)', background: 'rgba(255,255,255,0.045)' }}
                                        style={{ padding: 20, borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}
                                    >
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(57,255,20,0.12)', color: '#dbffe1', fontFamily: 'var(--font-punk)', fontSize: 18, marginBottom: 16 }}>{index + 1}</div>
                                        <div style={{ color: '#f3fff5', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</div>
                                        <div style={{ color: '#9cb29f', fontSize: 14, lineHeight: 1.7 }}>{item.description}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <RotatingFactsAside lang={lang} />
                    </div>
                </section>

                <footer style={{ padding: '44px clamp(20px, 5vw, 72px) 28px', borderTop: '1px solid rgba(126, 252, 141, 0.08)', background: 'rgba(3, 6, 4, 0.72)' }}>
                    <div className="home-footer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.2fr) repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: '#dcffe0', letterSpacing: '-0.02em', textTransform: 'none', marginBottom: 14 }}>Style Savvy</div>
                            <p style={{ color: '#91a695', fontSize: 14, lineHeight: 1.8 }}>
                                {text('A digital clothing platform centered on online fitting and custom 3D design.', 'Цифровая платформа про одежду, 3D-примерку и собственные дизайны без акцента на магазин.', 'Киім, 3D киіп көру және жеке дизайн жасауға арналған цифрлық платформа.')}
                            </p>
                        </div>
                        <div>
                            <div style={{ color: '#d6ffde', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14 }}>
                                {text('Platform', 'Платформа', 'Платформа')}
                            </div>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <a href="#overview" style={{ color: '#8fa394', textDecoration: 'none', fontSize: 14 }}>{text('Overview', 'Главный экран', 'Басты экран')}</a>
                                <a href="#categories" style={{ color: '#8fa394', textDecoration: 'none', fontSize: 14 }}>{text('Clothing groups', 'Группы одежды', 'Киім топтары')}</a>
                                <a href="#facts" style={{ color: '#8fa394', textDecoration: 'none', fontSize: 14 }}>{text('3D workflow', '3D-поток', '3D ағын')}</a>
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#d6ffde', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14 }}>Studio</div>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <a href="/studio" style={{ color: '#8fa394', textDecoration: 'none', fontSize: 14 }}>{text('Open 3D Design Studio', 'Открыть 3D Design Studio', '3D Design Studio ашу')}</a>
                                <a href="/login" style={{ color: '#8fa394', textDecoration: 'none', fontSize: 14 }}>{text('Login', 'Войти', 'Кіру')}</a>
                                <a href="/profile" style={{ color: '#8fa394', textDecoration: 'none', fontSize: 14 }}>{text('Profile', 'Профиль', 'Профиль')}</a>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 30, paddingTop: 18, borderTop: '1px solid rgba(126, 252, 141, 0.06)', color: '#6f8274', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {text('© 2026 Style Savvy. All rights reserved.', '© 2026 Style Savvy. Все права защищены.', '© 2026 Style Savvy. Барлық құқықтар қорғалған.')}
                    </div>
                </footer>
            </motion.div>
        );
    }

    const t = useT();

    const typewriterWords = ['STYLE SAVVY', 'TRY IT ON', 'DESIGN YOUR FIT', '3D STUDIO'];
    const { displayText, showCursor } = useTypewriter(typewriterWords, 90, 50, 1800);

    const products = [
        { id: 1, name: t('prod.hoodie'), price: '$80', desc: t('prod.hoodie.desc'), icon: '🧥', gradient: 'linear-gradient(135deg, #052e16 0%, #166534 100%)', accent: '#39ff14' },
        { id: 2, name: t('prod.ultraboost'), price: '$190', desc: t('prod.ultraboost.desc'), icon: '👟', gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', accent: '#34d399' },
        { id: 3, name: t('prod.tee'), price: '$35', desc: t('prod.tee.desc'), icon: '👕', gradient: 'linear-gradient(135deg, #0a1a0a 0%, #14532d 100%)', accent: '#4ade80' },
        { id: 4, name: t('prod.pants'), price: '$60', desc: t('prod.pants.desc'), icon: '🩳', gradient: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)', accent: '#86efac' },
        { id: 5, name: t('prod.jacket'), price: '$120', desc: t('prod.jacket.desc'), icon: '🧤', gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', accent: '#39ff14' },
        { id: 6, name: t('prod.beanie'), price: '$25', desc: t('prod.beanie.desc'), icon: '🧢', gradient: 'linear-gradient(135deg, #0a0f0a 0%, #1a2a1a 100%)', accent: '#22c55e' },
    ];

    const features = [
        { icon: '🔬', title: t('feat.aifit'), desc: t('feat.aifit.desc') },
        { icon: '🎲', title: t('feat.studio'), desc: t('feat.studio.desc') },
        { icon: '📦', title: t('feat.delivery'), desc: t('feat.delivery.desc') },
        { icon: '🔄', title: t('feat.returns'), desc: t('feat.returns.desc') },
    ];

    return (
        <motion.div
            ref={containerRef}
            style={{
                background: backgroundColor,
                color: '#ffffff',
                minHeight: '200vh',
                paddingBottom: '100px',
                position: 'relative',
            }}
        >
            <InkFilter />

            {/* Hero Section */}
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at center, rgba(57,255,20,0.04) 0%, transparent 60%)',
            }}>
                {/* Лёгкая CSS замена InteractiveShapes (убран 3×42MB Three.js) */}
                <FloatingParticles />

                <div style={{
                    position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '600px', height: '600px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(57,255,20,0.06) 0%, transparent 60%)',
                    pointerEvents: 'none', animation: 'glow-pulse 6s ease-in-out infinite',
                }} />

                <div style={{
                    height: '240px', width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', overflow: 'visible', zIndex: 10, position: 'relative',
                    pointerEvents: 'none'
                }}>
                    <h1
                        className="glitch-text"
                        data-text={displayText}
                        style={{
                            pointerEvents: 'auto', fontSize: 'clamp(60px, 12vw, 140px)',
                            margin: 0, lineHeight: 1, textTransform: 'uppercase',
                            letterSpacing: '0.05em', fontFamily: "var(--font-hero)",
                            color: '#39ff14', filter: 'url(#ink-filter)', position: 'absolute',
                            whiteSpace: 'nowrap', textAlign: 'center', minHeight: '1.2em',
                            textShadow: `
                                0 0 7px #39ff14, 0 0 20px rgba(57,255,20,0.5),
                                0 0 42px rgba(57,255,20,0.25), 3px 3px 0 rgba(0,255,245,0.2),
                                -3px -3px 0 rgba(255,45,123,0.15)
                            `,
                        }}
                    >
                        {displayText}
                        <span style={{
                            display: 'inline-block', width: '5px', height: '0.85em',
                            background: showCursor ? '#39ff14' : 'transparent',
                            marginLeft: '6px', verticalAlign: 'baseline', borderRadius: '1px',
                            boxShadow: showCursor ? '0 0 15px #39ff14, 0 0 30px rgba(57,255,20,0.5)' : 'none',
                            transition: 'background 0.1s ease, box-shadow 0.1s ease'
                        }} />
                    </h1>
                </div>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{
                        fontSize: '18px', marginTop: '10px', fontWeight: 400,
                        letterSpacing: '0.3em', textTransform: 'uppercase',
                        color: 'var(--text-muted)', fontFamily: 'var(--font-punk)',
                    }}
                >
                    {t('home.subtitle')}
                </motion.p>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ position: 'relative', zIndex: 20 }}
                >
                    <motion.button
                        onClick={() => navigate('/studio')}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: '0 0 40px rgba(57,255,20,0.5), 0 0 80px rgba(57,255,20,0.2)',
                            textShadow: '0 0 10px rgba(57,255,20,0.8)',
                        }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            marginTop: '50px', padding: '18px 50px', background: 'transparent',
                            color: '#39ff14', border: '2px solid #39ff14', borderRadius: '4px',
                            fontSize: '16px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                            boxShadow: '0 0 15px rgba(57,255,20,0.2), inset 0 0 15px rgba(57,255,20,0.05)',
                            fontFamily: 'var(--font-punk)', letterSpacing: '0.2em', transition: 'all 0.3s',
                        }}
                    >
                        {t('home.cta')}
                    </motion.button>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
                    style={{ position: 'absolute', bottom: '40px' }}
                >
                    <div style={{
                        width: '30px', height: '50px', border: '2px solid rgba(57,255,20,0.3)',
                        borderRadius: '15px', display: 'flex', justifyContent: 'center',
                        paddingTop: '10px', boxShadow: '0 0 8px rgba(57,255,20,0.1)',
                    }}>
                        <div style={{
                            width: '4px', height: '10px', background: '#39ff14',
                            borderRadius: '2px', boxShadow: '0 0 6px #39ff14',
                        }} />
                    </div>
                </motion.div>
            </div>

            {/* GLOW ORB SOURCES */}
            <div style={{ position: 'relative' }}>
                <GlowOrb x="5%" y="100px" size={300} delay={0} intensity={1.2} />
                <GlowOrb x="75%" y="250px" size={200} delay={0.3} />
                <GlowOrb x="15%" y="600px" size={250} delay={0.5} intensity={0.8} />
                <GlowOrb x="85%" y="800px" size={350} delay={0.2} intensity={1.1} />
                <GlowOrb x="50%" y="1200px" size={400} delay={0.4} intensity={1.3} />
                <GlowOrb x="10%" y="1500px" size={200} delay={0.6} />
                <GlowOrb x="70%" y="1700px" size={280} delay={0.1} intensity={0.9} />

                <PromoCarousel />

                {/* Clothing Grid */}
                <div style={{ padding: '100px 5%', position: 'relative' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '60px' }}
                    >
                        <p style={{
                            color: 'var(--primary)', fontSize: '14px', letterSpacing: '0.3em',
                            textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px',
                            fontFamily: 'var(--font-punk)', textShadow: '0 0 8px rgba(57,255,20,0.3)',
                        }}>{t('home.featured')}</p>
                        <h2
                            className="ink-text"
                            style={{
                                fontSize: '56px', textTransform: 'uppercase', letterSpacing: '0.05em',
                                fontWeight: 900, margin: 0, fontFamily: 'var(--font-punk)',
                            }}
                        >{t('home.latest')}</h2>
                    </motion.div>

                    <div className="product-grid-old" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {products.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -10 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{
                                    aspectRatio: '4/3', background: p.gradient, borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', position: 'relative',
                                    boxShadow: `0 20px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.3)`,
                                    border: '1px solid rgba(57,255,20,0.06)',
                                }}>
                                    <div style={{
                                        position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)',
                                        width: '180px', height: '70px', borderRadius: '50%', background: p.accent,
                                        filter: 'blur(40px)', opacity: 0.25,
                                    }} />

                                    <motion.div
                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                        style={{ fontSize: '90px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                                    >
                                        {p.icon}
                                    </motion.div>

                                    <div style={{
                                        position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.7)',
                                        backdropFilter: 'blur(10px)', padding: '5px 14px', borderRadius: '4px',
                                        fontWeight: 800, fontSize: '14px', border: '1px solid rgba(57,255,20,0.1)',
                                        fontFamily: 'var(--font-punk)', letterSpacing: '0.05em',
                                        color: p.accent, textShadow: `0 0 6px ${p.accent}50`,
                                    }}>
                                        {p.price}
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        style={{
                                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.07, boxShadow: '0 0 30px rgba(57,255,20,0.6)' }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate('/studio')}
                                            style={{
                                                padding: '13px 28px', borderRadius: '4px', border: '2px solid #39ff14',
                                                background: 'transparent', color: '#39ff14', fontSize: '14px',
                                                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-punk)',
                                                letterSpacing: '0.15em', textShadow: '0 0 8px rgba(57,255,20,0.5)',
                                            }}
                                        >
                                            {t('home.viewin3d')}
                                        </motion.button>
                                    </motion.div>
                                </div>

                                <div style={{ padding: '18px 4px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{
                                                fontWeight: 700, fontSize: '17px', letterSpacing: '0.05em', fontFamily: 'var(--font-punk)',
                                            }}>{p.name}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>{p.desc}</div>
                                        </div>
                                        <div style={{
                                            fontWeight: 800, fontSize: '17px', color: p.accent, flexShrink: 0,
                                            marginLeft: '12px', fontFamily: 'var(--font-punk)', textShadow: `0 0 6px ${p.accent}40`,
                                        }}>{p.price}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Features Section */}
                <div style={{ padding: '60px 5% 100px', borderTop: '1px solid rgba(57,255,20,0.06)', position: 'relative' }}>
                    <GlowOrb x="90%" y="50px" size={250} delay={0.3} intensity={0.7} />
                    <GlowOrb x="5%" y="200px" size={200} delay={0.5} intensity={0.6} />

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="ink-text"
                        style={{
                            fontSize: '44px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                            textAlign: 'center', marginBottom: '60px', fontFamily: 'var(--font-punk)',
                        }}
                    >
                        {t('home.whyus')}
                    </motion.h2>
                    <div className="features-grid-old" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{
                                    y: -6, borderColor: 'rgba(57,255,20,0.2)',
                                    boxShadow: '0 0 25px rgba(57,255,20,0.08), inset 0 0 20px rgba(57,255,20,0.03)',
                                }}
                                style={{
                                    padding: '32px', background: 'rgba(57,255,20,0.02)', borderRadius: '8px',
                                    border: '1px solid rgba(57,255,20,0.06)', transition: 'all 0.3s',
                                }}
                            >
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{f.icon}</div>
                                <div style={{
                                    fontWeight: 700, fontSize: '18px', marginBottom: '10px',
                                    fontFamily: 'var(--font-punk)', letterSpacing: '0.05em',
                                    color: '#39ff14', textShadow: '0 0 6px rgba(57,255,20,0.3)',
                                }}>{f.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="old-footer-grid" style={{
                    borderTop: '1px solid rgba(57,255,20,0.06)', padding: '60px 5%',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '40px',
                }}>
                    <div>
                        <div style={{
                            fontWeight: 900, fontSize: '24px', letterSpacing: '0.05em', marginBottom: '16px',
                            fontFamily: 'var(--font-punk)', color: '#39ff14', textShadow: '0 0 10px rgba(57,255,20,0.4)',
                        }}>{t('home.footer.brand')}</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.8 }}>{t('home.footer.desc')}</p>
                    </div>
                    {[{
                        title: t('home.footer.collection'), links: [t('home.footer.men'), t('home.footer.women'), t('home.footer.kids'), t('home.footer.studio')]
                    }, {
                        title: t('home.footer.experience'), links: [t('home.footer.studio'), t('home.footer.lookbook')]
                    }, {
                        title: t('home.footer.help'), links: [t('home.footer.faq'), t('home.footer.shipping'), t('home.footer.returns'), t('home.footer.contact')]
                    }].map(col => (
                        <div key={col.title}>
                            <div style={{
                                fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.2em',
                                marginBottom: '16px', color: 'var(--primary)', fontFamily: 'var(--font-punk)',
                                textShadow: '0 0 6px rgba(57,255,20,0.2)',
                            }}>{col.title}</div>
                            {col.links.map(link => (
                                <motion.div
                                    key={link}
                                    whileHover={{ x: 4, color: '#39ff14', textShadow: '0 0 6px rgba(57,255,20,0.4)' }}
                                    style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px', cursor: 'pointer', transition: 'color 0.2s' }}
                                >{link}</motion.div>
                            ))}
                        </div>
                    ))}
                </footer>
                <div style={{
                    textAlign: 'center', padding: '24px', borderTop: '1px solid rgba(57,255,20,0.04)',
                    color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'var(--font-punk)', letterSpacing: '0.1em',
                }}>
                    {t('home.footer.rights')}
                </div>
            </div>
        </motion.div>
    );
}
