import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOutfitStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../i18n/store';

// Pulse ring animation
function PulseRing({ delay }: { delay: number }) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeOut' }}
            style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '1px solid rgba(22,163,74,0.3)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
            }}
        />
    );
}

export function Verify() {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const verify = useOutfitStore((state) => state.verify);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const t = useT();

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
        // Auto-focus first input
        inputRefs.current[0]?.focus();
    }, [email, navigate]);

    const handleDigitChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedDigits = value.slice(0, 6).split('');
            const newDigits = [...digits];
            pastedDigits.forEach((d, i) => {
                if (index + i < 6) newDigits[index + i] = d;
            });
            setDigits(newDigits);
            const nextIndex = Math.min(index + pastedDigits.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);

        // Auto-focus next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join('');
        if (code.length !== 6) {
            setError(t('verify.input'));
            return;
        }

        setError('');
        setIsLoading(true);
        const result = await verify(email, code);
        setIsLoading(false);

        if (result) {
            setSuccess(true);
            setTimeout(() => navigate('/profile'), 1500);
        } else {
            setError(t('verify.error'));
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

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
            {/* Background */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)',
                        top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(60px)',
                    }}
                />
            </div>

            {/* Card */}
            <motion.div
                className="verify-card"
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
                    textAlign: 'center',
                }}
            >
                {/* Pulse rings */}
                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 30px' }}>
                    <PulseRing delay={0} />
                    <PulseRing delay={1} />
                    <PulseRing delay={2} />
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: success
                                ? 'linear-gradient(135deg, #22c55e, #10b981)'
                                : 'linear-gradient(135deg, #16a34a, #15803d)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: success
                                ? '0 0 40px rgba(34,197,94,0.4)'
                                : '0 0 40px rgba(22,163,74,0.4)',
                            transition: 'all 0.5s',
                            position: 'relative',
                            zIndex: 2,
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    ✓
                                </motion.span>
                            ) : (
                                <motion.span key="mail" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    ✉️
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 style={{
                                fontSize: '28px', fontWeight: 800,
                                background: 'linear-gradient(135deg, #22c55e, #10b981)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                marginBottom: '8px',
                            }}>
                                {t('verify.success')}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                                {t('verify.redirect')}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="form">
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    fontSize: '28px', fontWeight: 800,
                                    background: 'linear-gradient(135deg, #fff 0%, #a5a5b5 100%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    marginBottom: '8px',
                                }}
                            >
                                {t('verify.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '36px', lineHeight: 1.6 }}
                            >
                                {t('verify.subtitle')}
                                <strong style={{ color: 'var(--primary)' }}>{email}</strong>
                                <br />
                                <span style={{ fontSize: '12px', opacity: 0.6 }}>{t('verify.check')}</span>
                            </motion.p>

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

                            <form onSubmit={handleVerify}>
                                {/* 6 digit inputs */}
                                <div className="verify-otp-row" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
                                    {digits.map((digit, i) => (
                                        <motion.input
                                            key={i}
                                            ref={el => { inputRefs.current[i] = el; }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + i * 0.05 }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={digit}
                                            onChange={(e) => handleDigitChange(i, e.target.value.replace(/\D/g, ''))}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            className="verify-digit-input"
                                            style={{
                                                width: '52px',
                                                height: '60px',
                                                textAlign: 'center',
                                                fontSize: '24px',
                                                fontWeight: 800,
                                                fontFamily: 'var(--font-main)',
                                                background: digit
                                                    ? 'rgba(22,163,74,0.1)'
                                                    : 'rgba(255,255,255,0.04)',
                                                border: digit
                                                    ? '1.5px solid rgba(22,163,74,0.5)'
                                                    : '1.5px solid rgba(255,255,255,0.08)',
                                                borderRadius: '14px',
                                                color: '#fff',
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                                caretColor: 'var(--primary)',
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'rgba(22,163,74,0.6)';
                                                e.target.style.boxShadow = '0 0 20px rgba(22,163,74,0.2)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = digit ? 'rgba(22,163,74,0.5)' : 'rgba(255,255,255,0.08)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    ))}
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(22,163,74,0.4)' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
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
                                            {t('verify.btn')}
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                            >→</motion.span>
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}
                            >
                                {t('verify.resend')}
                                <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                                    {t('verify.resend_btn')}
                                </span>
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
