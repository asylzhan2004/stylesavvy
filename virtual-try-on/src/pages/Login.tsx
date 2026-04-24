import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOutfitStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../i18n/store';

// Floating particle component
function FloatingParticle({ delay, size, x, y, duration }: { delay: number; size: number; x: string; y: string; duration: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0.5],
                y: [0, -60, -120],
                x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(22,163,74,0.6), rgba(34,197,94,0.3))',
                left: x,
                top: y,
                pointerEvents: 'none',
                filter: 'blur(1px)',
            }}
        />
    );
}

// Animated grid line
function GridLine({ direction, position, delay }: { direction: 'h' | 'v'; position: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.06, 0.03] }}
            transition={{ delay, duration: 2 }}
            style={{
                position: 'absolute',
                ...(direction === 'h'
                    ? { left: 0, right: 0, top: position, height: '1px' }
                    : { top: 0, bottom: 0, left: position, width: '1px' }),
                background: direction === 'h'
                    ? 'linear-gradient(90deg, transparent, rgba(22,163,74,0.2), transparent)'
                    : 'linear-gradient(180deg, transparent, rgba(22,163,74,0.2), transparent)',
                pointerEvents: 'none',
            }}
        />
    );
}

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const t = useT();
    const login = useOutfitStore((state) => state.login);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (email && password) {
            setIsLoading(true);
            const success = await login(email, password);
            setIsLoading(false);
            if (success) {
                navigate('/profile');
            } else {
                setError(t('login.error'));
            }
        } else {
            setError(t('login.fillAllFields'));
        }
    };

    // Particles
    const particles = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        delay: Math.random() * 5,
        size: 3 + Math.random() * 6,
        x: `${Math.random() * 100}%`,
        y: `${50 + Math.random() * 50}%`,
        duration: 4 + Math.random() * 4,
    }));

    const inputStyle = (field: string) => ({
        padding: '16px 20px',
        background: focusedField === field ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.04)',
        border: focusedField === field ? '1px solid rgba(22,163,74,0.5)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        fontSize: '15px',
        color: '#fff',
        outline: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: 'var(--font-main)',
        width: '100%',
        boxSizing: 'border-box' as const,
        backdropFilter: 'blur(8px)',
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '70px',
        }}>
            {/* Animated Background */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {/* Gradient orbs */}
                <motion.div
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -40, 20, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)',
                        top: '-200px',
                        right: '-100px',
                        filter: 'blur(40px)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -40, 30, 0],
                        y: [0, 30, -50, 0],
                        scale: [1, 0.8, 1.1, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
                        bottom: '-150px',
                        left: '-100px',
                        filter: 'blur(40px)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, 30, -20, 0],
                        y: [0, -20, 40, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(21,128,61,0.1) 0%, transparent 70%)',
                        top: '40%',
                        left: '50%',
                        filter: 'blur(50px)',
                    }}
                />

                {/* Grid lines */}
                {Array.from({ length: 6 }, (_, i) => (
                    <GridLine key={`h-${i}`} direction="h" position={`${15 + i * 15}%`} delay={i * 0.2} />
                ))}
                {Array.from({ length: 8 }, (_, i) => (
                    <GridLine key={`v-${i}`} direction="v" position={`${10 + i * 12}%`} delay={i * 0.15} />
                ))}

                {/* Floating particles */}
                {particles.map((p) => (
                    <FloatingParticle key={p.id} {...p} />
                ))}
            </div>

            {/* Main Content */}
            <div className="login-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0',
                maxWidth: '1000px',
                width: '90%',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Left — Login Form */}
                <motion.div
                    className="login-left-panel"
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        padding: '50px 45px',
                        background: 'rgba(15,15,20,0.75)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px 0 0 24px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRight: 'none',
                    }}
                >
                    {/* Logo / Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '8px',
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 900,
                                color: 'white',
                            }}>S</div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Savvy style</span>
                        </div>
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #fff 0%, #a5a5b5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '8px',
                            letterSpacing: '-0.5px',
                        }}>
                            {t('login.welcome')}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '36px' }}>
                            {t('login.subtitle')}
                        </p>
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                style={{
                                    padding: '12px 16px',
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.25)',
                                    borderRadius: '12px',
                                    color: '#f87171',
                                    fontSize: '13px',
                                    marginBottom: '20px',
                                    fontWeight: 500,
                                }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Email field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                                {t('login.email')}
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                style={inputStyle('email')}
                            />
                        </motion.div>

                        {/* Password field */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                                    {t('login.password')}
                                </label>
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        fontSize: '11px',
                                        color: 'var(--primary)',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        userSelect: 'none',
                                    }}
                                >
                                    {showPassword ? t('login.hide') : t('login.show')}
                                </span>
                            </div>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                style={inputStyle('password')}
                            />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(22,163,74,0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
                                    backgroundSize: '200% 200%',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    marginTop: '8px',
                                    letterSpacing: '0.05em',
                                    fontFamily: 'var(--font-main)',
                                    boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    opacity: isLoading ? 0.8 : 1,
                                }}
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                        }}
                                    />
                                ) : (
                                    <>
                                        {t('login.submit')}
                                        <motion.span
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                        >→</motion.span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>

                    {/* Divider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            margin: '28px 0',
                        }}
                    >
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('login.or')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                    </motion.div>

                    {/* Social buttons */}
                    <motion.div
                        className="login-social-row"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{ display: 'flex', gap: '12px' }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-main)',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.2s',
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>📱</span> {t('login.phone')}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-main)',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.2s',
                            }}
                        >
                            <span style={{ color: '#ea4335', fontSize: '18px', fontWeight: 800 }}>G</span> {t('login.google')}
                        </motion.button>
                    </motion.div>

                    {/* Footer note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={{ marginTop: '24px', fontSize: '11px', color: 'rgba(161,161,170,0.6)', lineHeight: 1.6 }}
                    >
                        {t('login.terms')}
                    </motion.p>
                </motion.div>

                {/* Right — Register CTA */}
                <motion.div
                    className="login-right-panel"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                    style={{
                        padding: '50px 45px',
                        background: 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(21,128,61,0.08) 50%, rgba(34,197,94,0.06) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '0 24px 24px 0',
                        border: '1px solid rgba(22,163,74,0.15)',
                        borderLeft: '1px solid rgba(22,163,74,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Decorative elements */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            width: '300px',
                            height: '300px',
                            borderRadius: '50%',
                            border: '1px solid rgba(22,163,74,0.1)',
                            top: '-80px',
                            right: '-80px',
                            pointerEvents: 'none',
                        }}
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            border: '1px dashed rgba(34,197,94,0.1)',
                            bottom: '-40px',
                            left: '-40px',
                            pointerEvents: 'none',
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: 800,
                            marginBottom: '16px',
                            background: 'linear-gradient(135deg, #4ade80, #16a34a, #22c55e)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.2,
                        }}>
                            {t('login.newuser').split('?')[0]}?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
                            {t('login.newuser.desc')}
                        </p>
                    </motion.div>

                    {/* Benefits list */}
                    <motion.ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
                        {[
                            { icon: '✨', text: t('login.benefit1') },
                            { icon: '🎁', text: t('login.benefit2') },
                            { icon: '🔔', text: t('login.benefit3') },
                            { icon: '🎲', text: t('login.benefit4') },
                        ].map((item, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                <span>{item.text}</span>
                            </motion.li>
                        ))}
                    </motion.ul>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: 'transparent',
                                    color: 'white',
                                    border: '1.5px solid rgba(255,255,255,0.2)',
                                    borderRadius: '14px',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    letterSpacing: '0.05em',
                                    fontFamily: 'var(--font-main)',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {t('login.createaccount')}
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                                >→</motion.span>
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
