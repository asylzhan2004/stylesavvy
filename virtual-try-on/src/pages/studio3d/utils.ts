import * as THREE from 'three';
import { CH, CW, DECAL_IMAGE_MAX_SIDE, DECAL_TEXTURE_MAX, DECAL_TEXTURE_MIN } from './constants';

export function applyTextureQuality<T extends THREE.Texture>(tex: T): T {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
}

export function textureFromCanvas(canvas: HTMLCanvasElement) {
    return applyTextureQuality(new THREE.CanvasTexture(canvas));
}

export function fitPaintStampSize(width: number, height: number, maxSide = 420) {
    const largest = Math.max(width, height, 1);
    if (largest <= maxSide) return { width, height };
    const scale = maxSide / largest;
    return {
        width: Math.max(32, Math.round(width * scale)),
        height: Math.max(32, Math.round(height * scale)),
    };
}

export function fitImageSize(width: number, height: number, maxSide: number) {
    const largest = Math.max(width, height, 1);
    if (largest <= maxSide) return { width, height };
    const scale = maxSide / largest;
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

export function makeTextStampCanvas(opts: {
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    gradientEnabled?: boolean;
    gradientColor2?: string;
}) {
    const text = opts.text.trim();
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) return null;

    const renderFontSize = Math.max(64, Math.min(280, opts.fontSize * 4));
    measureCtx.font = `900 ${renderFontSize}px ${opts.fontFamily}`;
    const metrics = measureCtx.measureText(text);
    const paddingX = Math.round(renderFontSize * 0.35);
    const paddingY = Math.round(renderFontSize * 0.45);
    const rawWidth = Math.ceil(metrics.width + paddingX * 2);
    const rawHeight = Math.ceil(renderFontSize + paddingY * 2);
    const { width, height } = fitImageSize(
        Math.max(DECAL_TEXTURE_MIN, rawWidth),
        Math.max(DECAL_TEXTURE_MIN, rawHeight),
        DECAL_TEXTURE_MAX
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = width / Math.max(rawWidth, 1);
    const scaleY = height / Math.max(rawHeight, 1);
    const scale = Math.min(scaleX, scaleY);
    const finalFontSize = Math.max(32, Math.floor(renderFontSize * scale));

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.font = `900 ${finalFontSize}px ${opts.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (opts.gradientEnabled) {
        const gradient = ctx.createLinearGradient(0, height / 2, width, height / 2);
        gradient.addColorStop(0, opts.color);
        gradient.addColorStop(1, opts.gradientColor2 || opts.color);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = opts.color;
    }

    ctx.fillText(text, width / 2, height / 2);
    return canvas;
}

export function makeImageStampCanvas(img: HTMLImageElement) {
    const { width, height } = fitImageSize(img.naturalWidth || img.width, img.naturalHeight || img.height, DECAL_IMAGE_MAX_SIDE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
}

export function makeTextDecalTexture(opts: {
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    gradientEnabled?: boolean;
    gradientColor2?: string;
}) {
    const canvas = makeTextStampCanvas(opts);
    if (!canvas) return null;
    return textureFromCanvas(canvas);
}

export function makeImageDecalTexture(img: HTMLImageElement) {
    const canvas = makeImageStampCanvas(img);
    if (!canvas) return null;
    return textureFromCanvas(canvas);
}

export function shouldUseDecalForText(text: string, fontSize: number) {
    const width = Math.max(60, text.trim().length * fontSize * 0.55);
    const height = fontSize * 1.4;
    const areaRatio = (width * height) / (CW * CH);
    return width <= CW * 0.5 && height <= CH * 0.24 && areaRatio <= 0.12;
}

export function shouldUseDecalForImage(width: number, height: number) {
    const renderWidth = 130;
    const renderHeight = 130 * (height / Math.max(width, 1));
    const areaRatio = (renderWidth * renderHeight) / (CW * CH);
    return renderWidth <= CW * 0.45 && renderHeight <= CH * 0.35 && areaRatio <= 0.14;
}

export function pickBestModelHit(intersections: any[], model: THREE.Object3D) {
    const modelBox = new THREE.Box3().setFromObject(model);
    const modelVol = (() => {
        const s = new THREE.Vector3();
        modelBox.getSize(s);
        return s.x * s.y * s.z;
    })();
    const minVol = modelVol * 0.015;

    let bestHit: any = null;
    let bestVol = -1;
    for (const ix of intersections) {
        if (!ix.face || !ix.object) continue;
        const mesh = ix.object as THREE.Mesh;
        if (!mesh.isMesh) continue;
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        const vol = size.x * size.y * size.z;
        if (vol < minVol) continue;
        if (vol > bestVol) {
            bestVol = vol;
            bestHit = ix;
        }
    }

    if (!bestHit && intersections.length > 0) {
        bestHit = intersections.reduce((best: any, ix: any) => {
            if (!ix.object?.isMesh) return best;
            const box = new THREE.Box3().setFromObject(ix.object);
            const size = new THREE.Vector3();
            box.getSize(size);
            const vol = size.x * size.y * size.z;
            const bestBox = best ? new THREE.Box3().setFromObject(best.object) : null;
            const bestSize = new THREE.Vector3();
            bestBox?.getSize(bestSize);
            const bestVolInner = bestBox ? bestSize.x * bestSize.y * bestSize.z : -1;
            return vol > bestVolInner ? ix : best;
        }, null);
    }

    return bestHit;
}

export function createDecalPlacement(hit: any, model: THREE.Object3D, scale?: THREE.Vector3) {
    if (!hit?.face || !hit?.object) return null;
    const mesh = hit.object as THREE.Mesh;
    mesh.updateMatrixWorld(true);

    const position = hit.point.clone();
    const normal = hit.face.normal.clone().transformDirection(mesh.matrixWorld).normalize();
    const worldUp = Math.abs(normal.y) < 0.98
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);

    const right = new THREE.Vector3().crossVectors(worldUp, normal).normalize();
    const up = new THREE.Vector3().crossVectors(normal, right).normalize();
    const basis = new THREE.Matrix4().makeBasis(right, up, normal);
    const rotation = new THREE.Euler().setFromRotationMatrix(basis, 'XYZ');

    if (scale) {
        return { position, rotation, scale };
    }

    const bbox = new THREE.Box3().setFromObject(model);
    const bsz = new THREE.Vector3();
    bbox.getSize(bsz);
    const s = bsz.x * 0.2;
    return {
        position,
        rotation,
        scale: new THREE.Vector3(s, s, s * 0.15),
    };
}

