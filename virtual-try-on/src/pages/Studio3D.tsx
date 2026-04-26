import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLangStore } from '../i18n/store';

import { DynamicLights, SceneBg, SceneCapturer, TShirt3D, Toast } from './studio3d/components';
import { MODELS } from './studio3d/constants';
import { gBtn } from './studio3d/styles';
import { useLighting } from './studio3d/hooks/useLighting';
import { useDesign } from './studio3d/hooks/useDesign';
import { GenderSelection } from './studio3d/views/GenderSelection';
import { CategorySelection } from './studio3d/views/CategorySelection';
import { ExportModal } from './studio3d/views/ExportModal';
import { LightingPanel } from './studio3d/panels/LightingPanel';
import { ColorPanel } from './studio3d/panels/ColorPanel';
import { FabricPanel } from './studio3d/panels/FabricPanel';
import { ModelSwitcher } from './studio3d/panels/ModelSwitcher';
import { LayersPanel } from './studio3d/panels/LayersPanel';
import { TextForm } from './studio3d/panels/TextForm';
import { ElementProps } from './studio3d/panels/ElementProps';
import { PartSelector } from './studio3d/panels/PartSelector';

export function Studio3D() {
    const navigate = useNavigate();
    const currentLang = useLangStore(s => s.lang);

    // ── Wizard ──
    const [studioStep, setStudioStep] = useState<'gender' | 'category' | 'editor'>('gender');
    const [gender, setGender] = useState<'men' | 'women' | null>(null);
    const [category, setCategory] = useState<string | null>(null);

    // ── Scene ──
    const [bgColor, setBgColor] = useState('#C8D3E8');
    const [spin, setSpin] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);

    // ── Mobile swipe-up/down gesture on the sidebar handle ──
    const handleSidebarTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    }, []);
    const handleSidebarTouchEnd = useCallback((e: React.TouchEvent) => {
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (dy < -40) setMobilePanelOpen(true);   // swipe up → open
        if (dy > 40) setMobilePanelOpen(false);    // swipe down → close
    }, []);
    const [modelId, setModelId] = useState('kyim8');
    const currentModel = MODELS.find(m => m.id === modelId) ?? MODELS[0];

    // ── UI tabs ──
    const [activeTab, setActiveTab] = useState<'design' | 'lighting'>('design');
    const [colorTab, setColorTab] = useState<'swatches' | 'spectrum' | 'gradient'>('swatches');
    const [showTxt, setShowTxt] = useState(false);
    const [showClr, setShowClr] = useState(false);
    const [showFab, setShowFab] = useState(false);
    const [showMdl, setShowMdl] = useState(false);

    // ── Color ──
    const [shirtColor, setShirtColor] = useState('#FFFFFF');

    // ── Hooks ──
    const { lights, expandedLight, setExpandedLight, updLight, delLight, addLight, resetLights } = useLighting();

    const design = useDesign({
        currentModelUrl: currentModel.url,
        currentModelUvConfig: currentModel.uvConfig,
        setShirtColor,
    });

    // ── Smart preload ──
    useEffect(() => {
        useGLTF.preload(currentModel.url);
        const preloadRelated = () => {
            MODELS.filter(m => m.gender === currentModel.gender && m.category === currentModel.category && m.id !== currentModel.id)
                .forEach(m => useGLTF.preload(m.url));
        };
        const timer = setTimeout(preloadRelated, 1200);
        return () => clearTimeout(timer);
    }, [currentModel.url, currentModel.gender, currentModel.category]);

    // ── UV click to move selected element ──
    const { TEX_RES, CW, CH } = { TEX_RES: 2048, CW: 460, CH: 580 };
    const onModelClick = useCallback((u: number, v: number) => {
        // Try selection first if not in special modes
        if (!design.isMovingElement && !design.placementMode && !design.pendingPaint) {
            const wasSelected = design.selectElementAtUv(u, v);
            if (wasSelected) return;
        }

        if (!design.selId) return;
        const { targetW, targetH, offsetX, offsetY } = currentModel.uvConfig;
        const gs = TEX_RES / 1024;
        const rx = targetW * gs / CW, ry = targetH * gs / CH;
        const x = (u * TEX_RES - offsetX * gs) / rx;
        const y = (v * TEX_RES - offsetY * gs) / ry;
        design.upd(design.selId, { x, y });
    }, [design.selId, design.upd, design.isMovingElement, design.placementMode, design.pendingPaint, design.selectElementAtUv, currentModel, TEX_RES, CW, CH]);

    // ── Render design whenever deps change ──
    useEffect(() => {
        design.renderDesign(shirtColor);
    }, [design.renderDesign, shirtColor]);

    // ── Auto-scroll sidebar on mobile selection ──
    useEffect(() => {
        if (design.selId && sidebarRef.current && window.innerWidth <= 768) {
            const scrollContainer = sidebarRef.current.querySelector('.studio-panel-scroll');
            if (scrollContainer) {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                setMobilePanelOpen(true);
            }
        }
    }, [design.selId]);

    const t = (en: string, ru: string, kz: string) =>
        currentLang === 'ru' ? ru : currentLang === 'kz' ? kz : en;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="studio-shell"
            style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a', color: '#f8fafc', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* Toast */}
            <AnimatePresence>
                {design.toast && <Toast key={design.toast} msg={design.toast} onDone={() => design.setToast(null)} />}
            </AnimatePresence>

            {/* Export Modal */}
            <AnimatePresence>
                {design.exportModal && (
                    <ExportModal isOpen currentLang={currentLang}
                        loading={design.exportLoading}
                        onClose={() => design.setExportModal(false)}
                        onExport={design.triggerCapture} />
                )}
            </AnimatePresence>

            {/* Wizard overlay */}
            <AnimatePresence>
                {studioStep !== 'editor' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="studio-wizard-overlay"
                        style={{ position: 'absolute', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,4vw,36px)', background: 'radial-gradient(circle at top center,rgba(94,155,109,0.16) 0%,rgba(10,12,11,0.94) 38%,rgba(5,6,6,0.99) 100%)', backdropFilter: 'blur(24px)', overflow: 'hidden' }}>
                        <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/')}
                            style={{ position: 'absolute', top: 24, left: 24, ...gBtn, background: 'rgba(12,16,14,0.72)', backdropFilter: 'blur(18px)', boxShadow: '0 18px 40px rgba(0,0,0,0.24)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                            {t('Back', 'Назад', 'Артқа')}
                        </motion.button>
                        <div className="studio-wizard-stage" style={{ width: 'min(1120px,100%)', position: 'relative', zIndex: 1 }}>
                            <AnimatePresence mode="wait">
                                {studioStep === 'gender'
                                    ? <GenderSelection key="g" currentLang={currentLang} setGender={setGender} setStudioStep={setStudioStep} />
                                    : gender
                                        ? <CategorySelection key="c" currentLang={currentLang} gender={gender} setCategory={setCategory} setModelId={setModelId} setStudioStep={setStudioStep} />
                                        : null}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Topbar */}
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
                className="studio-topbar"
                style={{ height: 50, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', background: 'rgba(15,15,15,0.7)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 999 }}>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/')} style={gBtn}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                </motion.button>
                <span style={{ fontSize: 13, fontWeight: 900, background: 'linear-gradient(135deg,#22c55e,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.1em' }}>Studio3D</span>
                <div style={{ flex: 1 }} />
                <motion.button className="studio-mobile-toggle" whileTap={{ scale: 0.96 }} onClick={() => setMobilePanelOpen(v => !v)}
                    aria-pressed={mobilePanelOpen}
                    style={{ ...gBtn, background: mobilePanelOpen ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', color: mobilePanelOpen ? '#22c55e' : '#cbd5e1', border: mobilePanelOpen ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                    {mobilePanelOpen ? '↓ Panel' : '↑ Tools'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.04 }} onClick={() => setIsWalking(w => !w)} style={{ ...gBtn, background: isWalking ? 'rgba(34,197,94,0.1)' : 'transparent', color: isWalking ? '#22c55e' : '#94a3b8' }}>🚶 {isWalking ? 'Walking' : 'Walk'}</motion.button>
                <motion.button whileHover={{ scale: 1.04 }} onClick={() => setSpin(s => !s)} style={{ ...gBtn, background: spin ? 'rgba(34,197,94,0.1)' : 'transparent', color: spin ? '#22c55e' : '#94a3b8' }}>🔄 {spin ? 'Stop' : 'Rotate'}</motion.button>
                <motion.button whileHover={{ scale: 1.04 }} onClick={() => design.setExportModal(true)} style={{ ...gBtn, background: 'linear-gradient(135deg,#22c55e,#15803d)', color: 'white', border: 'none', fontWeight: 700, padding: '6px 16px' }}>📥 {t('Export', 'Экспорт', 'Экспорт')}</motion.button>
                <motion.button whileHover={{ rotate: -20, scale: 1.1 }} onClick={() => { design.setEls([]); design.setDecals([]); design.setPaintLayers([]); setShirtColor('#FFFFFF'); setSpin(false); design.setSelId(null); }}
                    style={{ ...gBtn, background: 'transparent' }}>↺</motion.button>
            </motion.div>

            {/* Body */}
            <div className="studio-content" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* 3D Canvas */}
                <motion.div ref={canvasContainerRef} className="studio-canvas" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }} style={{ flex: 1, position: 'relative' }}>
                    <Canvas shadows dpr={1} gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }} camera={{ position: [0, 1, 5], fov: 42 }} style={{ width: '100%', height: '100%' }}>
                        <SceneBg color={bgColor} />
                        <SceneCapturer requestRef={design.captureRef} />
                        <DynamicLights lights={lights} showGizmos={activeTab === 'lighting'} expandedLightId={expandedLight} updLight={updLight} setExpandedId={setExpandedLight} />
                        <Suspense fallback={<mesh><boxGeometry args={[1.5, 2, 0.2]} /><meshStandardMaterial color={shirtColor} /></mesh>}>
                            <TShirt3D
                                key={currentModel.id}
                                modelUrl={currentModel.url}
                                flipNormals={currentModel.flipNormals}
                                fixRotation={currentModel.fixRotation}
                                modelScale={currentModel.modelScale}
                                partCanvases={design.partCanvases.current}
                                setAvailableParts={design.setAvailableParts}
                                decals={design.decals}
                                placementMode={design.placementMode}
                                pendingTexture={design.pendingTexture}
                                pendingPaint={design.pendingPaint}
                                onDecalPlaced={design.onDecalPlaced}
                                onPaintPlaced={design.onPaintPlaced}
                                selDecalId={design.selDecalId}
                                selPaintId={design.selPaintId}
                                onDecalMove={design.moveDecalOnModel}
                                onPaintMove={design.movePaintOnModel}
                                onModelClick={onModelClick}
                                isMovingElement={design.isMovingElement}
                                onMoveElement={design.moveElementToUv}
                                isMovingPaint={design.isMovingPaint}
                                onMovePaint={design.movePaintToClick}
                                isWalking={isWalking}
                                spin={spin}
                            />
                        </Suspense>
                        <OrbitControls enablePan minDistance={0.3} maxDistance={15} zoomSpeed={2} panSpeed={1.5} rotateSpeed={1.2} minPolarAngle={Math.PI / 12} maxPolarAngle={Math.PI / 1.15} makeDefault target={[0, 0, 0]} />
                        {design.selId && <Html position={[0, 1.5, 0]} center><div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, border: '1px solid #22c55e', pointerEvents: 'none' }}><span style={{ color: '#22c55e', fontWeight: 'bold' }}>ALT+CLICK</span> to move</div></Html>}
                        {design.pendingPaint && <Html position={[0, 1.75, 0]} center><div style={{ background: 'rgba(34,197,94,0.9)', color: 'white', padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 'bold', border: '2px solid #fff', pointerEvents: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>📍 {t('TAP TO PLACE', 'НАЖМИТЕ ДЛЯ РАЗМЕЩЕНИЯ', 'ОРНАЛАСТЫРУ ҮШІН БАСЫҢЫЗ')}</div></Html>}
                        {design.isMovingElement && <Html position={[0, 1.75, 0]} center><div style={{ background: 'rgba(34,197,94,0.85)', color: 'white', padding: '8px 16px', borderRadius: 24, fontSize: 13, fontWeight: 'bold', border: '2px solid #ffffff', pointerEvents: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>📍 {t('CLICK TO PLACE', 'КЛИКНИТЕ ДЛЯ ПЕРЕНОСА', 'ОРНАЛАСТЫРУ ҮШІН БАСЫҢЫЗ')}</div></Html>}
                        {design.isMovingPaint && <Html position={[0, 1.75, 0]} center><div style={{ background: 'rgba(59,130,246,0.9)', color: 'white', padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 'bold', border: '2px solid #fff', pointerEvents: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>📍 {t('TAP TO MOVE PAINT', 'НАЖМИТЕ ДЛЯ ПЕРЕМЕЩЕНИЯ', 'Жылжыту Үшін басыңыз')}</div></Html>}
                    </Canvas>

                    {/* BG picker */}
                    <div className="studio-mobile-hide" style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '6px 10px', zIndex: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>BG</span>
                        <div style={{ position: 'relative', width: 22, height: 22, borderRadius: 5, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ position: 'absolute', inset: -4, width: 30, height: 30, cursor: 'pointer', border: 'none' }} />
                        </div>
                    </div>
                    <div className="studio-mobile-hide" style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '6px 16px', fontSize: 11, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', zIndex: 2 }}>
                        🖱️ ЛКМ: Вращать · ПКМ: Двигать · Колесико: Масштаб
                    </div>
                </motion.div>

                {/* Right panel */}
                <motion.div
                    ref={sidebarRef}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.25 }}
                    className={`studio-sidebar ${mobilePanelOpen ? 'studio-sidebar-open' : 'studio-sidebar-closed'}`}
                    onTouchStart={handleSidebarTouchStart}
                    onTouchEnd={handleSidebarTouchEnd}
                    style={{ width: 330, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)', borderLeft: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>

                    {/* Tabs */}
                    <div className="studio-toolbar" style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '8px 8px 0', gap: 4, flexShrink: 0 }}>
                        {(['design', 'lighting'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', border: 'none', background: activeTab === tab ? 'rgba(34,197,94,0.08)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 800, color: activeTab === tab ? '#22c55e' : '#64748b', borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottom: activeTab === tab ? '2px solid #22c55e' : 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {tab === 'design' ? '✏️ ' + t('Design', 'Дизайн', 'Дизайн') : '💡 ' + t('Lights', 'Свет', 'Жарық')}
                            </button>
                        ))}
                    </div>

                    {/* Lighting panel */}
                    {activeTab === 'lighting' && (
                        <LightingPanel lights={lights} expandedLight={expandedLight} setExpandedLight={setExpandedLight}
                            updLight={updLight} delLight={delLight} addLight={addLight}
                            resetLights={resetLights} />
                    )}

                    {/* Design panel */}
                    {activeTab === 'design' && (
                        <div className="studio-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 24px' }}>

                            {/* Section buttons */}
                            <div className="studio-chip-row" style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                                {[
                                    { label: '🎨 ' + t('Color', 'Цвет', 'Түс'), key: 'clr', state: showClr, set: setShowClr },
                                    { label: '🧵 ' + t('Fabric', 'Ткань', 'Мата'), key: 'fab', state: showFab, set: setShowFab },
                                    { label: '✏️ ' + t('Text', 'Текст', 'Мәтін'), key: 'txt', state: showTxt, set: setShowTxt },
                                    { label: '👕 ' + t('Model', 'Модель', 'Модель'), key: 'mdl', state: showMdl, set: setShowMdl },
                                ].map(({ label, key, state, set }) => (
                                    <button key={key} onClick={() => set(!state)}
                                        style={{ flex: 1, minWidth: 'calc(50% - 3px)', padding: '9px 6px', borderRadius: 10, border: state ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.07)', background: state ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)', color: state ? '#22c55e' : '#cbd5e1', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div style={{ marginBottom: 14, padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg,rgba(255,255,255,0.035) 0%,rgba(255,255,255,0.02) 100%)' }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                    {t('Photo Placement', 'Фото на одежду', 'Фото орналастыру')}
                                </div>
                                <div style={{ fontSize: 11, lineHeight: 1.55, color: '#94a3b8', marginBottom: 10 }}>
                                    {t(
                                        'Use auto mode for the easiest result, fabric mode for a flat print on cloth, or patch mode for a sticker-like placement.',
                                        'Используй авто-режим для самого простого результата, режим ткани для плоского принта, а patch-режим для размещения как нашивки.',
                                        'Ең оңай нәтиже үшін авто режимді, матаға тегіс принт үшін fabric режимін, ал жапсырмаға ұқсас орналастыру үшін patch режимін қолданыңыз.'
                                    )}
                                </div>
                                <div className="studio-action-row" style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                                    <label style={{ flex: 1, padding: '11px 8px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(34,197,94,0.07)', color: '#dcfce7', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                                        {t('Smart Auto', 'Умный авто', 'Ақылды авто')}
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={design.addImgAuto} />
                                    </label>
                                    <label style={{ flex: 1, padding: '11px 8px', borderRadius: 12, border: '1px solid rgba(59,130,246,0.22)', background: 'rgba(59,130,246,0.08)', color: '#bfdbfe', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                                        {t('Photo to Fabric', 'Фото в ткань', 'Фотоны матаға')}
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={design.addImgAsPaint} />
                                    </label>
                                    <label style={{ flex: 1, padding: '11px 8px', borderRadius: 12, border: '1px solid rgba(167,139,250,0.22)', background: 'rgba(167,139,250,0.08)', color: '#ddd6fe', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                                        {t('3D Patch', '3D-нашивка', '3D жапсырма')}
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={design.addDecalImgHq} />
                                    </label>
                                </div>
                                <div style={{ fontSize: 10, lineHeight: 1.5, color: '#64748b' }}>
                                    {t(
                                        'Auto and fabric modes will ask you to click on the model after the upload is ready.',
                                        'Авто-режим и режим ткани после загрузки попросят кликнуть по модели.',
                                        'Auto және fabric режимдері жүктелгеннен кейін модельге басуды сұрайды.'
                                    )}
                                </div>
                            </div>
                            {/* Image upload buttons */}
                            <div className="studio-action-row" style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                                <label style={{ flex: 1, padding: '9px 6px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', color: '#cbd5e1', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    🤖 AI Image
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={design.addImg} />
                                </label>
                                <label style={{ flex: 1, padding: '9px 6px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', color: '#cbd5e1', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    🖼️ Simple
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={design.addImgSimple} />
                                </label>
                                <label style={{ flex: 1, padding: '9px 6px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', color: '#cbd5e1', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    📌 Decal
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={design.addDecalImgHq} />
                                </label>
                            </div>

                            {/* Part selector */}
                            <PartSelector availableParts={design.availableParts} selectedPart={design.selectedPart} setSelectedPart={design.setSelectedPart} />

                            {/* Selected element props */}
                            <ElementProps
                                selId={design.selId} selDecalId={design.selDecalId} selPaintId={design.selPaintId}
                                els={design.els} decals={design.decals} paintLayers={design.paintLayers}
                                upd={design.upd} del={design.del}
                                setSelId={design.setSelId} setDecals={design.setDecals} setPaintLayers={design.setPaintLayers}
                                setSelDecalId={design.setSelDecalId} setSelPaintId={design.setSelPaintId}
                                isMovingElement={design.isMovingElement}
                                setIsMovingElement={design.setIsMovingElement}
                                isMovingPaint={design.isMovingPaint}
                                setIsMovingPaint={design.setIsMovingPaint}
                            />

                            {/* Text form */}
                            {showTxt && (
                                <TextForm
                                    txtVal={design.txtVal} setTxtVal={design.setTxtVal}
                                    txtColor={design.txtColor} setTxtColor={design.setTxtColor}
                                    txtSize={design.txtSize} setTxtSize={design.setTxtSize}
                                    txtFont={design.txtFont} setTxtFont={design.setTxtFont}
                                    addTextAuto={design.addTextAuto}
                                    addTextAsPaint={design.addTextAsPaint}
                                    addTextAsDecal={design.addTextAsDecal}
                                />
                            )}

                            {/* Color panel */}
                            {showClr && (
                                <ColorPanel
                                    colorTab={colorTab} setColorTab={setColorTab}
                                    selectedPart={design.selectedPart}
                                    shirtColor={shirtColor} setShirtColor={setShirtColor}
                                    shirtGradient={design.shirtGradient} setShirtGradient={design.setShirtGradient}
                                    partColors={design.partColors} setPartColors={design.setPartColors}
                                    partGradients={design.partGradients} setPartGradients={design.setPartGradients}
                                />
                            )}

                            {/* Fabric panel */}
                            {showFab && (
                                <FabricPanel
                                    selectedPart={design.selectedPart}
                                    fabric={design.fabric} setFabric={design.setFabric}
                                    partFabrics={design.partFabrics} setPartFabrics={design.setPartFabrics}
                                />
                            )}

                            {/* Model switcher */}
                            {showMdl && (
                                <ModelSwitcher modelId={modelId} setModelId={setModelId} gender={gender} category={category} />
                            )}

                            {/* Layers */}
                            <LayersPanel
                                els={design.els} decals={design.decals} paintLayers={design.paintLayers}
                                selId={design.selId} selDecalId={design.selDecalId} selPaintId={design.selPaintId}
                                setSelId={design.setSelId} setSelDecalId={design.setSelDecalId} setSelPaintId={design.setSelPaintId}
                                setDecals={design.setDecals} setPaintLayers={design.setPaintLayers}
                            />
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

