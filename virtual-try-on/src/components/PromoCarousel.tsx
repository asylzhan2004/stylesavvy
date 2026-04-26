import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const promos = [
    {
        id: 1,
        title: 'Summer Vibe',
        subtitle: "New Collection '26",
        desc: 'Lightweight fabrics made for the heat.',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        accent: '#fcd34d',
        icon: '☀️',
        tag: 'NEW DROP'
    },
    {
        id: 2,
        title: 'Urban Explore',
        subtitle: 'City Runner Series',
        desc: 'Built for the streets, designed to stand out.',
        gradient: 'linear-gradient(135deg, #16a34a 0%, #166534 100%)',
        accent: '#f9a8d4',
        icon: '🏙️',
        tag: 'TRENDING'
    },
    {
        id: 3,
        title: 'Night Run',
        subtitle: 'Performance Edition',
        desc: 'Maximum visibility. Maximum performance.',
        gradient: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
        accent: '#c4b5fd',
        icon: '🌙',
        tag: 'BEST SELLER'
    },
    {
        id: 4,
        title: 'Gym Focus',
        subtitle: 'Training Collection',
        desc: 'Every rep. Every set. Every goal.',
        gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        accent: '#93c5fd',
        icon: '💪',
        tag: 'EXCLUSIVE'
    },
    {
        id: 5,
        title: 'Relax Mode',
        subtitle: 'Comfort Essentials',
        desc: 'Soft, relaxed, effortlessly cool.',
        gradient: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
        accent: '#6ee7b7',
        icon: '🌿',
        tag: 'ECO FRIENDLY'
    },
];

export function PromoCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: scrollRef });
    const navigate = useNavigate();

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.clientWidth * 0.65;
        scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <div style={{ padding: '80px 0', overflow: 'hidden', position: 'relative' }}>
            {/* Section Header */}
            <div className="promo-section-header" style={{ padding: '0 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
                <div>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ color: 'var(--primary)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}
                    >
                        Campaigns
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: '42px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1.5px', color: 'var(--text-main)', margin: 0 }}
                    >
                        In Motion
                    </motion.h2>
                </div>

                {/* Scroll Arrows */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['left', 'right'].map(dir => (
                        <motion.button
                            key={dir}
                            whileHover={{ scale: 1.1, background: 'rgba(22,163,74,0.3)' }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => scroll(dir as 'left' | 'right')}
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-main)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                        >
                            {dir === 'left' ? '←' : '→'}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div
                ref={scrollRef}
                className="promo-scroll-container no-scrollbar"
                style={{
                    display: 'flex',
                    gap: '24px',
                    overflowX: 'auto',
                    padding: '12px 50px 24px',
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {promos.map((promo, i) => (
                    <motion.div
                        key={promo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="promo-card"
                        style={{
                            minWidth: '55vw',
                            height: '55vh',
                            borderRadius: '32px',
                            background: promo.gradient,
                            scrollSnapAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                            flexShrink: 0,
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onClick={() => navigate('/studio')}
                    >
                        {/* Huge Background Icon */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            fontSize: '220px',
                            opacity: 0.12,
                            lineHeight: 1,
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}>
                            {promo.icon}
                        </div>

                        {/* Glow blob */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-60px',
                            left: '10%',
                            width: '300px',
                            height: '150px',
                            borderRadius: '50%',
                            background: promo.accent,
                            filter: 'blur(60px)',
                            opacity: 0.25,
                            pointerEvents: 'none'
                        }} />

                        {/* Tag Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '28px',
                            left: '28px',
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: promo.accent,
                            padding: '5px 14px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.12em'
                        }}>
                            {promo.tag}
                        </div>

                        {/* Text Content */}
                        <div className="promo-card-content" style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>
                                {promo.subtitle}
                            </p>
                            <h3 style={{ color: 'white', fontSize: '36px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', margin: '0 0 8px' }}>
                                {promo.title}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: '0 0 22px', maxWidth: '350px' }}>
                                {promo.desc}
                            </p>
                            <motion.div
                                whileHover={{ x: 6 }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '10px 22px',
                                    borderRadius: '30px',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                Open Studio <span style={{ fontSize: '16px' }}>→</span>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Scroll Progress */}
            <div style={{ width: '160px', height: '3px', background: 'rgba(255,255,255,0.08)', margin: '16px auto 0', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div
                    style={{
                        scaleX: scrollXProgress,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        transformOrigin: 'left'
                    }}
                />
            </div>

            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
}
