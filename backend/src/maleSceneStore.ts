import fs from 'node:fs/promises';
import path from 'node:path';

export type Vector3Tuple = [number, number, number];

export interface BonePose {
    position: Vector3Tuple;
    rotation: Vector3Tuple;
}

export interface MaleGarmentPreset {
    garmentId: string;
    garmentName: string;
    garmentUrl: string;
    category: string;
    garmentTransform: {
        position: Vector3Tuple;
        rotation: Vector3Tuple;
        scale: Vector3Tuple;
    };
    avatarPose: {
        bones: Record<string, BonePose>;
    };
    updatedAt: string;
}

export interface MaleSceneStore {
    version: number;
    modelUrl: string;
    featuredGarmentId: string | null;
    garments: Record<string, MaleGarmentPreset>;
    updatedAt: string;
}

const STORE_FILE_PATH = path.resolve(process.cwd(), 'data', 'male-scene-presets.json');
const DEFAULT_MODEL_URL = '/models/men/base man/basemale.glb';

const createDefaultStore = (): MaleSceneStore => ({
    version: 1,
    modelUrl: DEFAULT_MODEL_URL,
    featuredGarmentId: null,
    garments: {},
    updatedAt: new Date().toISOString(),
});

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const toVector3 = (value: unknown, fallback: Vector3Tuple): Vector3Tuple => {
    if (Array.isArray(value) && value.length === 3) {
        const next = value.map((item) => Number(item));
        if (next.every((item) => Number.isFinite(item))) {
            return [next[0], next[1], next[2]];
        }
    }

    return fallback;
};

const normalizeBonePose = (value: unknown): BonePose => {
    const maybePose = value as Partial<BonePose> | undefined;

    return {
        position: toVector3(maybePose?.position, [0, 0, 0]),
        rotation: toVector3(maybePose?.rotation, [0, 0, 0]),
    };
};

const normalizePreset = (garmentId: string, value: unknown): MaleGarmentPreset => {
    const maybePreset = value as Partial<MaleGarmentPreset> | undefined;
    const bones: Record<string, BonePose> = {};
    const rawBones = maybePreset?.avatarPose?.bones;

    if (rawBones && typeof rawBones === 'object') {
        for (const [boneName, bonePose] of Object.entries(rawBones)) {
            if (!boneName.trim()) {
                continue;
            }

            bones[boneName] = normalizeBonePose(bonePose);
        }
    }

    return {
        garmentId,
        garmentName: typeof maybePreset?.garmentName === 'string' && maybePreset.garmentName.trim()
            ? maybePreset.garmentName
            : garmentId,
        garmentUrl: typeof maybePreset?.garmentUrl === 'string' ? maybePreset.garmentUrl : '',
        category: typeof maybePreset?.category === 'string' && maybePreset.category.trim()
            ? maybePreset.category
            : 'tops',
        garmentTransform: {
            position: toVector3(maybePreset?.garmentTransform?.position, [0, 0, 0]),
            rotation: toVector3(maybePreset?.garmentTransform?.rotation, [0, 0, 0]),
            scale: toVector3(maybePreset?.garmentTransform?.scale, [1, 1, 1]),
        },
        avatarPose: {
            bones,
        },
        updatedAt: typeof maybePreset?.updatedAt === 'string' && maybePreset.updatedAt
            ? maybePreset.updatedAt
            : new Date().toISOString(),
    };
};

const normalizeStore = (value: unknown): MaleSceneStore => {
    const maybeStore = value as Partial<MaleSceneStore> | undefined;
    const garments: Record<string, MaleGarmentPreset> = {};
    const rawGarments = maybeStore?.garments;

    if (rawGarments && typeof rawGarments === 'object') {
        for (const [garmentId, preset] of Object.entries(rawGarments)) {
            if (!garmentId.trim()) {
                continue;
            }

            garments[garmentId] = normalizePreset(garmentId, preset);
        }
    }

    const featuredGarmentId =
        typeof maybeStore?.featuredGarmentId === 'string' && maybeStore.featuredGarmentId.trim()
            ? maybeStore.featuredGarmentId
            : null;

    return {
        version: isFiniteNumber(maybeStore?.version) ? maybeStore.version : 1,
        modelUrl: typeof maybeStore?.modelUrl === 'string' && maybeStore.modelUrl.trim()
            ? maybeStore.modelUrl
            : DEFAULT_MODEL_URL,
        featuredGarmentId,
        garments,
        updatedAt: typeof maybeStore?.updatedAt === 'string' && maybeStore.updatedAt
            ? maybeStore.updatedAt
            : new Date().toISOString(),
    };
};

const ensureStoreFile = async () => {
    try {
        await fs.access(STORE_FILE_PATH);
    } catch {
        await fs.mkdir(path.dirname(STORE_FILE_PATH), { recursive: true });
        await fs.writeFile(STORE_FILE_PATH, JSON.stringify(createDefaultStore(), null, 2), 'utf8');
    }
};

export const readMaleSceneStore = async (): Promise<MaleSceneStore> => {
    await ensureStoreFile();
    const raw = await fs.readFile(STORE_FILE_PATH, 'utf8');

    return normalizeStore(JSON.parse(raw));
};

export const writeMaleSceneStore = async (value: unknown): Promise<MaleSceneStore> => {
    const normalized = normalizeStore(value);

    await fs.mkdir(path.dirname(STORE_FILE_PATH), { recursive: true });
    await fs.writeFile(STORE_FILE_PATH, JSON.stringify(normalized, null, 2), 'utf8');

    return normalized;
};
