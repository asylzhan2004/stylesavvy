import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import type { DesignEl, Decal3D, PaintLayer, PendingPaintLayer, GradientConfig, CaptureRequest } from '../types';
import { DEFAULT_GRADIENT, TEX_RES, CW, CH, FABRIC_TEXTURES } from '../constants';
import {
    fitPaintStampSize,
    makeImageDecalTexture,
    makeImageStampCanvas,
    makeTextDecalTexture,
    makeTextStampCanvas,
    shouldUseDecalForImage,
    shouldUseDecalForText,
} from '../utils';

interface UseDesignProps {
    currentModelUrl: string;
    currentModelUvConfig: { targetW: number; targetH: number; offsetX: number; offsetY: number };
    setShirtColor: (c: string) => void;
}

export function useDesign({ currentModelUrl: _url, currentModelUvConfig, setShirtColor }: UseDesignProps) {
    // ── UI state ──
    const [els, setEls] = useState<DesignEl[]>([]);
    const [decals, setDecals] = useState<Decal3D[]>([]);
    const [paintLayers, setPaintLayers] = useState<PaintLayer[]>([]);
    const [placementMode, setPlacementMode] = useState(false);
    const [pendingTexture, setPendingTexture] = useState<THREE.Texture | null>(null);
    const [pendingPaint, setPendingPaint] = useState<PendingPaintLayer | null>(null);
    const [selId, setSelId] = useState<string | null>(null);
    const [selDecalId, setSelDecalId] = useState<string | null>(null);
    const [selPaintId, setSelPaintId] = useState<string | null>(null);
    const [isMovingElement, setIsMovingElement] = useState(false);
    const [isMovingPaint, setIsMovingPaint] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // ── Texture canvas per mesh part ──
    const [availableParts, setAvailableParts] = useState<string[]>([]);
    const [selectedPart, setSelectedPart] = useState<string>('all');
    const [shirtGradient, setShirtGradient] = useState<GradientConfig>(DEFAULT_GRADIENT);
    const [partColors, setPartColors] = useState<Record<string, string>>({});
    const [partGradients, setPartGradients] = useState<Record<string, GradientConfig>>({});
    const [partFabrics, setPartFabrics] = useState<Record<string, string>>({});
    const [fabric, setFabric] = useState('none');
    const [fabricImages, setFabricImages] = useState<Record<string, HTMLImageElement>>({});
    const partCanvases = useRef<Record<string, HTMLCanvasElement>>({});
    const renderRafId = useRef<number>(0);

    // ── Text form state ──
    const [txtVal, setTxtVal] = useState('');
    const [txtColor, setTxtColor] = useState('#000000');
    const [txtSize, setTxtSize] = useState(42);
    const [txtFont, setTxtFont] = useState('Impact');

    // ── Export ──
    const captureRef = useRef<((req: CaptureRequest) => void) | null>(null);
    const [exportModal, setExportModal] = useState(false);
    const [exportLoading, setExportLoading] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => setToast(msg), []);

    // ── Load fabric images on demand ──
    useEffect(() => {
        const used = new Set([fabric, ...Object.values(partFabrics)]);
        used.forEach(fId => {
            if (fId === 'none' || fabricImages[fId]) return;
            const tex = FABRIC_TEXTURES.find(f => f.id === fId);
            if (tex?.src) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => setFabricImages(p => ({ ...p, [fId]: img }));
                img.src = tex.src;
            }
        });
    }, [fabric, partFabrics, fabricImages]);

    const getPartCanvas = useCallback((name: string) => {
        if (!partCanvases.current[name]) {
            const cvs = document.createElement('canvas');
            cvs.width = TEX_RES; cvs.height = TEX_RES;
            partCanvases.current[name] = cvs;
        }
        return partCanvases.current[name];
    }, []);

    const renderTimerId = useRef<number>(0);
    const lastRenderTime = useRef<number>(0);
    const renderPending = useRef(false);

    // ── Render design → canvases → notify Three.js ──
    const renderDesign = useCallback((
        shirtColor: string,
    ) => {
        renderPending.current = true;

        const executeRender = () => {
            renderPending.current = false;
            lastRenderTime.current = performance.now();
            cancelAnimationFrame(renderRafId.current);
            renderRafId.current = requestAnimationFrame(() => {
                const partsToRender = availableParts.length > 0 ? availableParts : ['default'];
            const globalScale = TEX_RES / 1024;

            partsToRender.forEach(partName => {
                const cvs = getPartCanvas(partName);
                const ctx = cvs.getContext('2d')!;
                const pColor = partColors[partName] || shirtColor;
                const pGrad = partGradients[partName] || shirtGradient;
                const pFab = partFabrics?.[partName] || fabric;

                // Background
                if (pGrad.enabled) {
                    let fill: CanvasGradient;
                    if (pGrad.type === 'radial') {
                        const cx = cvs.width / 2, cy = cvs.height / 2;
                        fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cvs.width, cvs.height) * 0.7);
                    } else {
                        const rad = pGrad.angle * Math.PI / 180;
                        const hw = cvs.width / 2, hh = cvs.height / 2;
                        fill = ctx.createLinearGradient(
                            hw - Math.cos(rad) * hw, hh - Math.sin(rad) * hh,
                            hw + Math.cos(rad) * hw, hh + Math.sin(rad) * hh,
                        );
                    }
                    fill.addColorStop(Math.max(0, Math.min(1, pGrad.stop1)), pGrad.color1);
                    fill.addColorStop(Math.max(0, Math.min(1, pGrad.stop2)), pGrad.color2);
                    ctx.fillStyle = fill;
                } else {
                    ctx.fillStyle = pColor;
                }
                ctx.fillRect(0, 0, cvs.width, cvs.height);

                // Fabric layer (multiply)
                const fImg = fabricImages[pFab];
                if (fImg) {
                    ctx.globalCompositeOperation = 'multiply';
                    const pattern = ctx.createPattern(fImg, 'repeat');
                    if (pattern) {
                        ctx.fillStyle = pattern;
                        ctx.save(); ctx.scale(0.3, 0.3);
                        ctx.fillRect(0, 0, cvs.width * 4, cvs.height * 4);
                        ctx.restore();
                    }
                    ctx.globalCompositeOperation = 'source-over';
                }

                const { targetW, targetH, offsetX, offsetY } = currentModelUvConfig;
                const scaledTargetW = targetW * globalScale, scaledTargetH = targetH * globalScale;
                const scaledOffsetX = offsetX * globalScale, scaledOffsetY = offsetY * globalScale;
                const rx = scaledTargetW / CW, ry = scaledTargetH / CH;

                // 2D elements
                els.forEach(el => {
                    ctx.save();
                    ctx.translate(scaledOffsetX + el.x * rx, scaledOffsetY + el.y * ry);
                    ctx.rotate(el.rotation * Math.PI / 180);
                    if (el.type === 'text') {
                        const fs = el.fontSize * rx;
                        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
                        ctx.font = `900 ${fs}px ${el.fontFamily}`;
                        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                        if (el.gradientEnabled) {
                            const grd = ctx.createLinearGradient(-el.w / 2 * rx, 0, el.w / 2 * rx, 0);
                            grd.addColorStop(0, el.color); grd.addColorStop(1, el.gradientColor2 || '#000');
                            ctx.fillStyle = grd;
                        } else { ctx.fillStyle = el.color; }
                        ctx.fillText(el.content, 0, 0);
                    } else if (el.type === 'image' && el.imgEl) {
                        ctx.drawImage(el.imgEl, -el.w * rx / 2, -el.h * ry / 2, el.w * rx, el.h * ry);
                    }
                    ctx.restore();
                });

                // Paint layers
                paintLayers.filter(l => l.partName === partName).forEach(layer => {
                    ctx.save();
                    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
                    ctx.translate(layer.u * cvs.width, layer.v * cvs.height);
                    ctx.rotate(layer.rotation * Math.PI / 180);
                    ctx.drawImage(layer.stamp, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
                    ctx.restore();
                });

                // Subtle seam hint
                ctx.fillStyle = 'rgba(0,0,0,0.02)';
                ctx.beginPath();
                ctx.moveTo(cvs.width / 2 - 80 * globalScale, 0);
                ctx.lineTo(cvs.width / 2 + 80 * globalScale, 0);
                ctx.lineTo(cvs.width / 2, 60 * globalScale);
                ctx.fill();
            });

            window.dispatchEvent(new CustomEvent('tex-sync'));
        });
        };

        const now = performance.now();
        const TIME_BETWEEN_RENDERS = 50; // max ~20 FPS for 2K canvas redraws

        if (now - lastRenderTime.current > TIME_BETWEEN_RENDERS) {
            executeRender();
        } else {
            if (!renderTimerId.current) {
                renderTimerId.current = window.setTimeout(() => {
                    renderTimerId.current = 0;
                    if (renderPending.current) executeRender();
                }, TIME_BETWEEN_RENDERS - (now - lastRenderTime.current));
            }
        }
    }, [availableParts, els, paintLayers, shirtGradient, fabric, partColors, partGradients, partFabrics, fabricImages, currentModelUvConfig, getPartCanvas]);

    // ── Element CRUD ──
    const upd = useCallback((id: string, u: Partial<DesignEl>) =>
        setEls(p => p.map(e => e.id === id ? { ...e, ...u } : e)), []);

    const del = useCallback((id: string) => { setEls(p => p.filter(e => e.id !== id)); setSelId(null); }, []);

    // ── Keyboard delete ──
    useEffect(() => {
        const k = (e: KeyboardEvent) => {
            if (!selId) return;
            const tag = (document.activeElement as HTMLElement)?.tagName;
            if ((e.key === 'Delete' || e.key === 'Backspace') && tag !== 'INPUT' && tag !== 'TEXTAREA') del(selId);
            if (e.key === 'Escape') setSelId(null);
        };
        window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
    }, [selId, del]);

    // ── Decal placement ──
    const onDecalPlaced = useCallback((decal: Omit<Decal3D, 'id'>) => {
        setDecals(prev => [...prev, { ...decal, id: Date.now().toString() }]);
        setPlacementMode(false); setPendingTexture(null);
        showToast('✓ 3D Decal placed!');
    }, [showToast]);

    const moveDecalOnModel = useCallback((id: string, updates: Pick<Decal3D, 'position' | 'rotation'>) =>
        setDecals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d)), []);

    const startPaintPlacement = useCallback((draft: PendingPaintLayer) => {
        setPendingPaint(draft); setPlacementMode(false); setPendingTexture(null);
        showToast(`${draft.label}: click on the model to paint.`);
    }, [showToast]);

    const onPaintPlaced = useCallback((partName: string, u: number, v: number) => {
        setPendingPaint(prev => {
            if (!prev) return prev;
            setPaintLayers(layers => [...layers, { id: Date.now().toString(), partName, u, v, ...prev }]);
            showToast('Texture paint applied.');
            return null;
        });
    }, [showToast]);

    const movePaintOnModel = useCallback((id: string, updates: Pick<PaintLayer, 'partName' | 'u' | 'v'>) =>
        setPaintLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l)), []);

    const startDecalPlacement = useCallback((tex: THREE.Texture, label: string) => {
        setPendingTexture(tex); setPendingPaint(null); setPlacementMode(true); setIsMovingElement(false);
        showToast(`${label} ready. Click on the 3D model to place it.`);
    }, [showToast]);

    const moveElementToUv = useCallback((u: number, v: number, silent = false) => {
        if (!selId) return;
        const { targetW, targetH, offsetX, offsetY } = currentModelUvConfig;
        const newX = (u * 1024 - offsetX) * (CW / targetW);
        const newY = (v * 1024 - offsetY) * (CH / targetH);
        upd(selId, { x: newX, y: newY });
        if (!silent) {
            setIsMovingElement(false);
            showToast('✓ Element moved!');
        }
    }, [selId, currentModelUvConfig, upd, showToast]);

    const movePaintToClick = useCallback((partName: string, u: number, v: number) => {
        if (!selPaintId) return;
        movePaintOnModel(selPaintId, { partName, u, v });
        setIsMovingPaint(false);
        showToast('✓ Перемещено!');
    }, [selPaintId, movePaintOnModel, showToast]);

    // ── Text add helpers ──
    const addText = useCallback(() => {
        if (!txtVal.trim()) return;
        setEls(p => [...p, {
            id: Date.now().toString(), type: 'text', content: txtVal.trim(),
            x: CW / 2, y: CH * 0.4,
            w: Math.max(60, txtVal.length * txtSize * 0.55), h: txtSize * 1.4,
            color: txtColor, fontSize: txtSize, fontFamily: txtFont, rotation: 0,
            gradientEnabled: false, gradientColor2: '#22c55e', gradientAngle: 0,
        }]);
        setTxtVal(''); showToast('✓ Text added!');
    }, [txtVal, txtColor, txtSize, txtFont, showToast]);

    const selectElementAtUv = useCallback((u: number, v: number) => {
        const { targetW, targetH, offsetX, offsetY } = currentModelUvConfig;
        const x = (u * 1024 - offsetX) * (CW / targetW);
        const y = (v * 1024 - offsetY) * (CH / targetH);

        // Find element under (x, y). Check in reverse (top-most first)
        const hit = [...els].reverse().find(el => {
            const hw = el.w / 2, hh = el.h / 2;
            // Simple hit test for rotated box could be complex, 
            // but let's do a simple AABB check first for better UX
            return x >= el.x - hw && x <= el.x + hw && y >= el.y - hh && y <= el.y + hh;
        });

        if (hit) {
            setSelId(hit.id);
            setSelDecalId(null);
            setSelPaintId(null);
            return true;
        }
        return false;
    }, [els, currentModelUvConfig]);

    const addTextAsDecal = useCallback(() => {
        if (!txtVal.trim()) return;
        const tex = makeTextDecalTexture({ text: txtVal, fontFamily: txtFont, fontSize: txtSize, color: txtColor });
        if (!tex) { showToast('Failed to prepare text decal.'); return; }
        startDecalPlacement(tex, 'HQ text'); setTxtVal('');
    }, [txtVal, txtFont, txtSize, txtColor, startDecalPlacement, showToast]);

    const addTextAsPaint = useCallback(() => {
        if (!txtVal.trim()) return;
        const stamp = makeTextStampCanvas({ text: txtVal, fontFamily: txtFont, fontSize: txtSize, color: txtColor });
        if (!stamp) { showToast('Failed to prepare paint text.'); return; }
        const size = fitPaintStampSize(stamp.width, stamp.height);
        startPaintPlacement({ type: 'text', label: 'Text paint', width: size.width, height: size.height, rotation: 0, stamp });
        setTxtVal('');
    }, [txtVal, txtFont, txtSize, txtColor, startPaintPlacement, showToast]);

    const addTextAuto = useCallback(() => {
        if (!txtVal.trim()) return;
        shouldUseDecalForText(txtVal, txtSize) ? addTextAsDecal() : addText();
    }, [txtVal, txtSize, addTextAsDecal, addText]);

    // ── Image add helpers (simple / AI BG-removal) ──
    const addImgSimple = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = ev => {
            const src = ev.target!.result as string;
            const img = new Image();
            img.onload = () => {
                setEls(p => [...p, {
                    id: Date.now().toString(), type: 'image', content: src,
                    x: CW / 2, y: CH * 0.4, w: 130, h: 130 * (img.height / img.width) || 130,
                    color: '', fontSize: 0, fontFamily: '', rotation: 0, imgEl: img,
                    gradientEnabled: false, gradientColor2: '', gradientAngle: 0,
                }]);
                showToast('✓ Фото добавлено!');
            };
            img.src = src;
        };
        rd.readAsDataURL(f); e.target.value = '';
    }, [showToast]);

    const addImg = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        showToast('⏳ Инициализация ИИ (около 5 сек)...');
        try {
            const { removeBackground } = await import('@imgly/background-removal');
            const blob = await removeBackground(f);
            const noBgUrl = URL.createObjectURL(blob);
            const origUrl = URL.createObjectURL(f);
            const img = new Image();
            img.onload = () => {
                try {
                    const aiCvs = document.createElement('canvas'); const aiCtx = aiCvs.getContext('2d');
                    if (aiCtx) {
                        aiCvs.width = 100; aiCvs.height = 100 * (img.height / img.width) || 100;
                        aiCtx.drawImage(img, 0, 0, aiCvs.width, aiCvs.height);
                        const pxs = aiCtx.getImageData(0, 0, aiCvs.width, aiCvs.height).data;
                        let r = 0, g = 0, b = 0, count = 0;
                        for (let i = 0; i < pxs.length; i += 16) {
                            if (pxs[i + 3] > 128) { r += pxs[i]; g += pxs[i + 1]; b += pxs[i + 2]; count++; }
                        }
                        if (count > 0) {
                            r = Math.floor(r / count); g = Math.floor(g / count); b = Math.floor(b / count);
                            const hex = '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
                            setShirtColor(hex);
                            showToast(`🤖 AI: Цвет (${hex}) и принт вырезаны!`);
                        }
                    }
                } catch { /* ignore */ }
                const noBgImg = new Image();
                noBgImg.onload = () => {
                    setEls(p => [...p, {
                        id: Date.now().toString(), type: 'image', content: noBgUrl,
                        x: CW / 2, y: CH * 0.4, w: 130, h: 130 * (noBgImg.height / noBgImg.width) || 130,
                        color: '', fontSize: 0, fontFamily: '', rotation: 0, imgEl: noBgImg,
                        gradientEnabled: false, gradientColor2: '', gradientAngle: 0,
                    }]);
                };
                noBgImg.src = noBgUrl;
            };
            img.src = origUrl;
        } catch { showToast('❌ Ошибка при удалении фона ИИ'); }
        e.target.value = '';
    }, [setShirtColor, showToast]);

    // ── Decal image helpers ──
    const addDecalImgHq = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = ev => {
            const src = ev.target!.result as string;
            const img = new Image();
            img.onload = () => {
                const tex = makeImageDecalTexture(img);
                if (!tex) { showToast('Failed to prepare decal.'); return; }
                startDecalPlacement(tex, 'HQ decal');
            };
            img.src = src;
        };
        rd.readAsDataURL(f); e.target.value = '';
    }, [startDecalPlacement, showToast]);

    const addImgSimpleAsDecal = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = ev => {
            const src = ev.target!.result as string;
            const img = new Image();
            img.onload = () => {
                const tex = makeImageDecalTexture(img);
                if (!tex) { showToast('Failed to prepare print image.'); return; }
                startDecalPlacement(tex, 'HQ print');
            };
            img.src = src;
        };
        rd.readAsDataURL(f); e.target.value = '';
    }, [startDecalPlacement, showToast]);

    // Paint image helpers
    const addImgSimpleAsPaint = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = ev => {
            const src = ev.target!.result as string;
            const img = new Image();
            img.onload = () => {
                const stamp = makeImageStampCanvas(img);
                if (!stamp) { showToast('Failed to prepare texture paint.'); return; }
                const size = fitPaintStampSize(stamp.width, stamp.height);
                startPaintPlacement({ type: 'image', label: 'Image paint', width: size.width, height: size.height, rotation: 0, stamp });
            };
            img.src = src;
        };
        rd.readAsDataURL(f); e.target.value = '';
    }, [startPaintPlacement, showToast]);

    const addImgAsPaint = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        showToast('⏳ Инициализация ИИ...');
        try {
            const { removeBackground } = await import('@imgly/background-removal');
            const blob = await removeBackground(f);
            const noBgUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                const noBgImg = new Image();
                noBgImg.onload = () => {
                    const stamp = makeImageStampCanvas(noBgImg);
                    if (!stamp) { showToast('Failed to prepare AI paint.'); return; }
                    const size = fitPaintStampSize(stamp.width, stamp.height);
                    startPaintPlacement({ type: 'image', label: 'AI paint', width: size.width, height: size.height, rotation: 0, stamp });
                };
                noBgImg.src = noBgUrl;
            };
            img.src = URL.createObjectURL(f);
        } catch { showToast('❌ Ошибка при удалении фона ИИ'); }
        e.target.value = '';
    }, [startPaintPlacement, showToast]);

    const addImgSimpleAuto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = ev => {
            const src = ev.target!.result as string;
            const img = new Image();
            img.onload = () => {
                shouldUseDecalForImage(img.width, img.height) ? addImgSimpleAsDecal(e) : addImgSimple(e);
            };
            img.src = src;
        };
        rd.readAsDataURL(f);
    }, [addImgSimpleAsDecal, addImgSimple]);

    const addImgAuto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = ev => {
            const src = ev.target!.result as string;
            const img = new Image();
            img.onload = () => {
                shouldUseDecalForImage(img.width, img.height) ? addImgSimpleAsDecal(e) : addImg(e);
            };
            img.src = src;
        };
        rd.readAsDataURL(f);
    }, [addImgSimpleAsDecal, addImg]);

    // ── Export ──
    const triggerCapture = useCallback((req: CaptureRequest) => {
        if (!captureRef.current) { alert('3D scene not ready'); return; }
        setExportLoading(req.type.toUpperCase());
        requestAnimationFrame(() => requestAnimationFrame(() => {
            captureRef.current?.(req);
            setTimeout(() => setExportLoading(null), 600);
        }));
    }, []);

    return {
        // Elements
        els, setEls, decals, setDecals, paintLayers, setPaintLayers,
        placementMode, pendingTexture, pendingPaint,
        selId, setSelId, selDecalId, setSelDecalId, selPaintId, setSelPaintId,
        toast, setToast,
        // Parts / texture
        availableParts, setAvailableParts, selectedPart, setSelectedPart,
        shirtGradient, setShirtGradient,
        partColors, setPartColors, partGradients, setPartGradients,
        partFabrics, setPartFabrics, fabric, setFabric,
        partCanvases, getPartCanvas, renderDesign,
        // Text form
        txtVal, setTxtVal, txtColor, setTxtColor, txtSize, setTxtSize, txtFont, setTxtFont,
        // Export
        captureRef, exportModal, setExportModal, exportLoading, triggerCapture,
        // Handlers
        upd, del,
        addText, addTextAsDecal, addTextAsPaint, addTextAuto,
        addImg, addImgSimple, addImgSimpleAsPaint, addImgAsPaint,
        addImgAuto, addImgSimpleAuto, addDecalImgHq, addImgSimpleAsDecal,
        onDecalPlaced, moveDecalOnModel,
        onPaintPlaced, movePaintOnModel,
        startPaintPlacement, startDecalPlacement,
        isMovingElement, setIsMovingElement, moveElementToUv,
        selectElementAtUv,
        isMovingPaint, setIsMovingPaint, movePaintToClick,
    };
}
