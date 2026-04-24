import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOutfitStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../i18n/store';

// Animated ring background
function AnimatedRing({ size, position, delay, duration, color }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: [0, 0.1, 0.05],
                scale: [0.8, 1.1, 0.9],
                rotate: [0, 180, 360],
            }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
            style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `1px solid ${color}`,
                ...position,
                pointerEvents: 'none',
            }}
        />
    );
}

export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1: info, 2: password
    const register = useOutfitStore((state) => state.register);
    const navigate = useNavigate();
    const t = useT();

    const handleNext = () => {
        if (!name || !email) {
            setError(t('reg.error.name'));
            return;
        }
        setError('');
        setStep(2);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            handleNext();
            return;
        }

        if (!password) {
            setError(t('reg.error.password'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('reg.error.confirm'));
            return;
        }
        if (password.length < 5) {
            setError(t('reg.error.password'));
            return;
        }

        setIsLoading(true);
        const success = await register(name, email, password);
        setIsLoading(false);

        if (success) {
            navigate('/verify', { state: { email } });
        } else {
            setError(t('reg.error.general'));
        }
    };

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

    // Password strength
    const getPasswordStrength = () => {
        if (!password) return { width: '0%', color: 'transparent', label: '' };
        if (password.length < 5) return { width: '25%', color: '#ef4444', label: t('reg.weak') };
        if (password.length < 8) return { width: '50%', color: '#f59e0b', label: t('reg.medium') };
        if (password.length < 12) return { width: '75%', color: '#16a34a', label: t('reg.good') };
        return { width: '100%', color: '#22c55e', label: t('reg.strong') };
    };

    const strength = getPasswordStrength();

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
                <motion.div
                    animate={{ x: [0, 40, -20, 0], y: [0, -30, 50, 0], scale: [1, 1.15, 0.95, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(21,128,61,0.15) 0%, transparent 70%)',
                        top: '-100px', left: '30%', filter: 'blur(50px)',
                    }}
                />
                <motion.div
                    animate={{ x: [0, -30, 40, 0], y: [0, 40, -20, 0], scale: [1, 0.85, 1.1, 1] }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
                        bottom: '-200px', right: '-100px', filter: 'blur(50px)',
                    }}
                />

                {/* Animated rings */}
                <AnimatedRing size={300} position={{ top: '10%', right: '15%' }} delay={0} duration={20} color="rgba(22,163,74,0.15)" />
                <AnimatedRing size={200} position={{ bottom: '15%', left: '10%' }} delay={2} duration={15} color="rgba(34,197,94,0.1)" />
                <AnimatedRing size={150} position={{ top: '50%', left: '5%' }} delay={4} duration={25} color="rgba(21,128,61,0.08)" />
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    maxWidth: '480px',
                    width: '90%',
                    padding: '50px 45px',
                    background: 'rgba(15,15,20,0.8)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '28px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
                }}
            >
                {/* Progress bar */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '36px',
                }}>
                    <motion.div
                        style={{
                            flex: 1, height: '3px', borderRadius: '2px',
                            background: 'linear-gradient(90deg, #16a34a, #15803d)',
                        }}
                    />
                    <motion.div
                        animate={{ background: step >= 2 ? 'linear-gradient(90deg, #15803d, #166534)' : 'rgba(255,255,255,0.08)' }}
                        style={{
                            flex: 1, height: '3px', borderRadius: '2px',
                            background: 'rgba(255,255,255,0.08)',
                        }}
                    />
                </div>

                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px',
                    }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', fontWeight: 900, color: 'white',
                        }}>G</div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Gravity</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 style={{
                                fontSize: '32px', fontWeight: 800,
                                background: 'linear-gradient(135deg, #fff 0%, #a5a5b5 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                marginBottom: '8px', letterSpacing: '-0.5px',
                            }}>
                                {step === 1 ? t('reg.title') : t('reg.pwd_title')}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
                                {step === 1 ? t('reg.subtitle') : t('reg.pwd_desc')}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            style={{
                                padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px',
                                color: '#f87171', fontSize: '13px', marginBottom: '20px', fontWeight: 500,
                            }}
                        >
                            ⚠️ {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                            >
                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                                        {t('reg.name')}
                                    </label>
                                    <input
                                        id="register-name"
                                        type="text"
                                        placeholder="Ваше имя"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        style={inputStyle('name')}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                                        {t('reg.email')}
                                    </label>
                                    <input
                                        id="register-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        style={inputStyle('email')}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                                            {t('reg.password')}
                                        </label>
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                fontSize: '11px', color: 'var(--primary)', cursor: 'pointer',
                                                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', userSelect: 'none',
                                            }}
                                        >
                                            {showPassword ? t('login.hide') : t('login.show')}
                                        </span>
                                    </div>
                                    <input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        style={inputStyle('password')}
                                    />

                                    {/* Password strength bar */}
                                    {password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            style={{ marginTop: '10px' }}
                                        >
                                            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <motion.div
                                                    animate={{ width: strength.width }}
                                                    style={{
                                                        height: '100%',
                                                        background: strength.color,
                                                        borderRadius: '2px',
                                                    }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <div style={{ fontSize: '11px', color: strength.color, marginTop: '6px', fontWeight: 600 }}>
                                                {strength.label}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                                        {t('reg.confirm')}
                                    </label>
                                    <input
                                        id="register-confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={() => setFocusedField('confirm')}
                                        onBlur={() => setFocusedField(null)}
                                        style={inputStyle('confirm')}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        {step === 2 && (
                            <motion.button
                                type="button"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                onClick={() => { setStep(1); setError(''); }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    padding: '16px 24px',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-muted)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '14px',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-main)',
                                }}
                            >
                                ←
                            </motion.button>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(22,163,74,0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                flex: 1,
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
                                letterSpacing: '0.05em',
                                fontFamily: 'var(--font-main)',
                                boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
                                opacity: isLoading ? 0.8 : 1,
                            }}
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                    style={{
                                        width: '20px', height: '20px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white', borderRadius: '50%',
                                    }}
                                />
                            ) : (
                                <>
                                    {step === 1 ? t('reg.next') : t('reg.submit')}
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                    >→</motion.span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ marginTop: '28px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}
                >
                    {t('reg.haveaccount')}{' '}
                    <Link to="/login" style={{
                        fontWeight: 700,
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}>
                        {t('reg.signin')}
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
