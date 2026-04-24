import type * as THREE from 'three';

export interface DesignEl {
    id: string;
    type: 'text' | 'image';
    content: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    gradientEnabled: boolean;
    gradientColor2: string;
    gradientAngle: number;
    fontSize: number;
    fontFamily: string;
    rotation: number;
    imgEl?: HTMLImageElement;
}

export interface Decal3D {
    id: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    texture: THREE.Texture;
    label: string;
}

export interface PaintLayer {
    id: string;
    type: 'text' | 'image';
    label: string;
    partName: string;
    u: number;
    v: number;
    width: number;
    height: number;
    rotation: number;
    stamp: HTMLCanvasElement;
}

export interface PendingPaintLayer {
    type: 'text' | 'image';
    label: string;
    width: number;
    height: number;
    rotation: number;
    stamp: HTMLCanvasElement;
}

export interface GradientConfig {
    enabled: boolean;
    type: 'linear' | 'radial';
    color1: string;
    color2: string;
    angle: number;
    stop1: number;
    stop2: number;
}

export type LightType = 'directional' | 'point' | 'spot';

export interface LightConfig {
    id: string;
    name: string;
    type: LightType;
    x: number;
    y: number;
    z: number;
    intensity: number;
    color: string;
    enabled: boolean;
}

export type CaptureRequest = { type: 'png' | 'jpeg'; quality?: number } | { type: 'glb' };

export interface TShirt3DProps {
    modelUrl: string;
    flipNormals?: boolean;
    fixRotation?: [number, number, number];
    modelScale?: number;
    partCanvases: Record<string, HTMLCanvasElement>;
    setAvailableParts: React.Dispatch<React.SetStateAction<string[]>>;
    decals: Decal3D[];
    placementMode: boolean;
    pendingTexture: THREE.Texture | null;
    pendingPaint: PendingPaintLayer | null;
    onDecalPlaced: (decal: Omit<Decal3D, 'id'>) => void;
    onPaintPlaced: (partName: string, u: number, v: number) => void;
    selDecalId: string | null;
    selPaintId: string | null;
    onDecalMove: (id: string, updates: Pick<Decal3D, 'position' | 'rotation'>) => void;
    onPaintMove: (id: string, updates: Pick<PaintLayer, 'partName' | 'u' | 'v'>) => void;
    onModelClick: (u: number, v: number) => void;
    isMovingElement?: boolean;
    onMoveElement?: (u: number, v: number, silent?: boolean) => void;
    isMovingPaint?: boolean;
    onMovePaint?: (partName: string, u: number, v: number) => void;
    isWalking: boolean;
    spin: boolean;
}
