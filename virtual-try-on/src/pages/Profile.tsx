import { useOutfitStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../i18n/store';

export function Profile() {
    const { user, logout } = useOutfitStore();
    const navigate = useNavigate();
    const t = useT();
    const [activeTab, setActiveTab] = useState('Overview');
    const wishlistItems: any[] = [];
    const orders: any[] = [];

    const tabs = [
        { id: 'Overview', label: t('profile.tabs.overview') },
        { id: 'Orders', label: t('profile.tabs.orders') },
        { id: 'Wishlist', label: t('profile.tabs.wishlist') },
        { id: 'Settings', label: t('profile.tabs.settings') }
    ];

    const stats = [
        { label: t('profile.stats.orders'), value: orders.length.toString(), icon: '📦' },
        { label: t('profile.stats.points'), value: (user?.points || 0).toLocaleString(), icon: '⭐' },
        { label: t('profile.stats.saved'), value: wishlistItems.length.toString(), icon: '❤️' },
        { label: t('profile.stats.level'), value: user?.level || 'Bronze', icon: '🏅' },
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
            {/* Header Banner */}
            <div className="profile-banner" style={{
                height: '260px',
                background: 'linear-gradient(135deg, #052e16 0%, #14532d 30%, #166534 60%, #15803d 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(22,163,74,0.15)', top: '-100px', right: '-50px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', bottom: '-60px', left: '100px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none' }} />
            </div>

            {/* Profile Card */}
            <div className="profile-main-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 30px', position: 'relative', zIndex: 10 }}>
                <div className="profile-header-row" style={{ marginTop: '-70px', marginBottom: '40px', display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
                    <motion.div
                        className="profile-avatar"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '42px', fontWeight: 900, border: '4px solid var(--bg-dark)',
                            boxShadow: '0 0 30px rgba(22,163,74,0.5)', flexShrink: 0,
                            cursor: 'pointer', color: 'white'
                        }}
                    >
                        {initials}
                    </motion.div>

                    <div style={{ flex: 1, paddingBottom: '8px' }}>
                        <motion.h1
                            className="profile-name"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}
                        >
                            {user.name} {user.role === 'admin' && <span style={{ fontSize: '14px', verticalAlign: 'middle', padding: '2px 8px', background: 'rgba(251,191,36,0.2)', color: '#fbbf24', borderRadius: '6px', marginLeft: '10px' }}>Admin</span>}
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '15px' }}
                        >
                            {user.email} &nbsp;·&nbsp; 🏅 {t('profile.member')} &nbsp;·&nbsp; ID: ADI-8829-3992
                        </motion.p>
                    </div>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { logout(); navigate('/'); }}
                        style={{
                            padding: '10px 24px', background: 'rgba(239,68,68,0.12)', color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-main)',
                            letterSpacing: '0.05em', marginBottom: '8px'
                        }}
                    >
                        {t('profile.signout')}
                    </motion.button>
                </div>

                {/* Stats Row */}
                <div className="profile-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i + 0.3 }}
                            style={{
                                padding: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{s.value}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="profile-tabs-row" style={{ display: 'flex', gap: '4px', marginBottom: '32px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '5px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {tabs.map(tab => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                padding: '9px 22px', borderRadius: '10px', border: 'none',
                                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-main)',
                                transition: 'all 0.2s ease', boxShadow: activeTab === tab.id ? '0 4px 12px rgba(22,163,74,0.4)' : 'none'
                            }}
                        >
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        style={{ paddingBottom: '80px' }}
                    >
                        {/* OVERVIEW TAB */}
                        {activeTab === 'Overview' && (
                            <div className="profile-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('profile.recent')}</h3>
                                    {orders.slice(0, 2).map(order => (
                                        <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '15px' }}>{order.product}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{order.id} · {order.date}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '13px', padding: '3px 10px', borderRadius: '20px', background: `${order.color}22`, color: order.color, fontWeight: 600 }}>{order.status}</span>
                                                <span style={{ fontWeight: 700 }}>{order.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setActiveTab('Orders')} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '14px', padding: 0, fontFamily: 'var(--font-main)' }}>
                                        {t('profile.viewall')}
                                    </button>
                                </div>

                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('profile.progress')}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>🏅 Gold</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>1,250 / 2,000 pts</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '62.5%' }}
                                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>750 {t('profile.pts_until')} <strong style={{ color: '#4ade80' }}>Platinum</strong> level</p>

                                    <div style={{ marginTop: '28px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('profile.quick')}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {[
                                                { label: '⚡ 3D Studio', path: '/studio' },
                                                ...(user.role === 'admin' ? [{ label: '🛠️ Men Scene Editor', path: '/admin/men-scene' }] : [])
                                            ].map(action => (
                                                <motion.button key={action.path} whileHover={{ x: 5 }} whileTap={{ scale: 0.97 }}
                                                    onClick={() => navigate(action.path)}
                                                    style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '14px', fontWeight: 500 }}
                                                >
                                                    {action.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ORDERS TAB */}
                        {activeTab === 'Orders' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {orders.map((order, i) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        whileHover={{ scale: 1.01 }}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '22px 28px', background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)',
                                            cursor: 'default'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${order.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                                                📦
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '15px' }}>{order.product}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>Order {order.id} · {order.date}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <span style={{ padding: '5px 14px', borderRadius: '20px', background: `${order.color}22`, color: order.color, fontSize: '13px', fontWeight: 700 }}>
                                                {order.status}
                                            </span>
                                            <span style={{ fontWeight: 800, fontSize: '16px' }}>{order.price}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* WISHLIST TAB */}
                        {activeTab === 'Wishlist' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                                {wishlistItems.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                        whileHover={{ y: -5 }}
                                        style={{
                                            padding: '28px', background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)',
                                            position: 'relative', overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{item.icon}</div>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{item.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{item.category}</div>
                                        <div style={{ fontWeight: 800, fontSize: '20px', marginTop: '12px', color: 'var(--primary)' }}>{item.price}</div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/studio')}
                                                style={{ flex: 1, padding: '9px', background: 'var(--primary)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '12px' }}>
                                                {t('profile.view3d')}
                                            </motion.button>
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/studio')}
                                                style={{ padding: '9px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#f87171', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '14px' }}>
                                                ✕
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === 'Settings' && (
                            <div style={{ maxWidth: '600px' }}>
                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{t('profile.details')}</h3>
                                    {[
                                        { label: 'Full Name', value: user.name },
                                        { label: 'Email', value: user.email },
                                        { label: 'Member ID', value: 'ADI-8829-3992' },
                                    ].map(field => (
                                        <div key={field.label}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{field.label}</div>
                                            <div style={{
                                                padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
                                                fontSize: '15px', fontWeight: 500
                                            }}>{field.value}</div>
                                        </div>
                                    ))}
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(22,163,74,0.4)' }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{ padding: '13px', background: 'var(--primary)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '15px' }}
                                    >
                                        {t('profile.save')}
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
