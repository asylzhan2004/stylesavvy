import type React from 'react';

/** Ghost icon button in the top bar */
export const gBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 12px',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 9,
    background: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    fontSize: 11, fontWeight: 600, color: '#f8fafc',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
};

/** Toggle-style panel header button */
export const tBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 10px',
    border: `1px solid ${active ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 10,
    background: active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
    color: active ? '#22c55e' : '#cbd5e1',
    fontSize: 11, fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
});

/** Small +/− size stepper button */
export const szBtn: React.CSSProperties = {
    width: 28, height: 28,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    fontSize: 15, fontWeight: 700, color: '#f8fafc',
    fontFamily: 'inherit',
    padding: 0,
};
