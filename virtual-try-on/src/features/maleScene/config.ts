export type Vector3Tuple = [number, number, number];

export type MaleGarmentCategory = 'tops' | 'outerwear' | 'bottoms' | 'underwear' | 'footwear';

export interface BonePose {
    position: Vector3Tuple;
    rotation: Vector3Tuple;
}

export interface MaleGarmentPreset {
    garmentId: string;
    garmentName: string;
    garmentUrl: string;
    category: MaleGarmentCategory;
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

export interface MaleGarmentCatalogItem {
    id: string;
    name: string;
    category: MaleGarmentCategory;
    url: string;
}

export interface MaleBoneGroup {
    id: string;
    label: string;
    bones: string[];
}

export const MALE_BASE_MODEL_URL = '/models/men/base man/basemale.glb';

export const MALE_GARMENTS: MaleGarmentCatalogItem[] = [
    { id: 'bezrukavka', name: 'Bezrukavka', category: 'tops', url: '/models/men/tops/Bezrukavka.glb' },
    { id: 'cloth10', name: 'Cloth 10', category: 'tops', url: '/models/men/tops/cloth10.glb' },
    { id: 'jempir', name: 'Jempir', category: 'tops', url: '/models/men/tops/Jempir.glb' },
    { id: 'jempir2', name: 'Jempir 2', category: 'tops', url: '/models/men/tops/Jempir2.glb' },
    { id: 'kyim8blend', name: 'Kyim 8 Blend', category: 'tops', url: '/models/men/tops/Kyim8blend.glb' },
    { id: 'menshirt', name: 'Men Shirt', category: 'tops', url: '/models/men/tops/menshirt.glb' },
    { id: 'coat2', name: 'Coat 2', category: 'outerwear', url: '/models/men/outerwear/coat2.glb' },
    { id: 'jacket2', name: 'Jacket 2', category: 'outerwear', url: '/models/men/outerwear/Jacket2.glb' },
    { id: 'jacketmoda', name: 'Jacket Moda', category: 'outerwear', url: '/models/men/outerwear/Jacketmoda.glb' },
    { id: 'jakcketsport', name: 'Jacket Sport', category: 'outerwear', url: '/models/men/outerwear/jakcketsport.glb' },
    { id: 'blue-european-wash-jeans-1', name: 'Blue European Wash Jeans 1', category: 'bottoms', url: '/models/men/bottoms/Blue European wash jeans1.glb' },
    { id: 'blue-european-wash-jeans-2', name: 'Blue European Wash Jeans 2', category: 'bottoms', url: '/models/men/bottoms/Blue European wash jeans2.glb' },
    { id: 'jeansblend2', name: 'Jeans Blend 2', category: 'bottoms', url: '/models/men/bottoms/jeansblend2.glb' },
    { id: 'jeansblend3', name: 'Jeans Blend 3', category: 'bottoms', url: '/models/men/bottoms/jeansblend3.glb' },
    { id: 'shalbar2', name: 'Shalbar 2', category: 'bottoms', url: '/models/men/bottoms/Шалбар2.glb' },
    { id: 'shalbar3', name: 'Shalbar 3', category: 'bottoms', url: '/models/men/bottoms/Шалбар3.glb' },
    { id: 'shalbar4', name: 'Shalbar 4', category: 'bottoms', url: '/models/men/bottoms/шалбар4.glb' },
    { id: 'shorts', name: 'Shorts', category: 'bottoms', url: '/models/men/bottoms/Шорты.glb' },
    { id: 'pants1', name: 'Pants 1', category: 'bottoms', url: '/models/men/bottoms/Штаны1.glb' },
    { id: 'fit2', name: 'Fit 2', category: 'underwear', url: '/models/men/underwear/fit2.glb' },
    { id: 'fit3', name: 'Fit 3', category: 'underwear', url: '/models/men/underwear/fit3.glb' },
    { id: 'fit4-1', name: 'Fit 4.1', category: 'underwear', url: '/models/men/underwear/fit4,1.glb' },
    { id: 'fit4', name: 'Fit 4', category: 'underwear', url: '/models/men/underwear/fit4.glb' },
    { id: 'shoesmen', name: 'Shoes Men 1', category: 'footwear', url: '/models/men/footwear/shoesmen.glb' },
    { id: 'shoesmen2', name: 'Shoes Men 2', category: 'footwear', url: '/models/men/footwear/shoesmen2.glb' },
    { id: 'shoesmen3', name: 'Shoes Men 3', category: 'footwear', url: '/models/men/footwear/shoesmen3.glb' },
];

export const MALE_BONE_GROUPS: MaleBoneGroup[] = [
    {
        id: 'torso',
        label: 'Torso',
        bones: ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'],
    },
    {
        id: 'left-arm',
        label: 'Left Arm',
        bones: ['LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand'],
    },
    {
        id: 'right-arm',
        label: 'Right Arm',
        bones: ['RightShoulder', 'RightArm', 'RightForeArm', 'RightHand'],
    },
    {
        id: 'left-leg',
        label: 'Left Leg',
        bones: ['LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase'],
    },
    {
        id: 'right-leg',
        label: 'Right Leg',
        bones: ['RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase'],
    },
];

export const EDITABLE_MALE_BONES = MALE_BONE_GROUPS.flatMap((group) => group.bones);

export const createDefaultMaleGarmentPreset = (garment: MaleGarmentCatalogItem): MaleGarmentPreset => ({
    garmentId: garment.id,
    garmentName: garment.name,
    garmentUrl: garment.url,
    category: garment.category,
    garmentTransform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
    },
    avatarPose: {
        bones: {},
    },
    updatedAt: new Date().toISOString(),
});

export const createDefaultMaleSceneStore = (): MaleSceneStore => ({
    version: 1,
    modelUrl: MALE_BASE_MODEL_URL,
    featuredGarmentId: MALE_GARMENTS[0]?.id ?? null,
    garments: {},
    updatedAt: new Date().toISOString(),
});

export const findMaleGarmentById = (garmentId: string | null | undefined) =>
    MALE_GARMENTS.find((item) => item.id === garmentId) ?? null;
