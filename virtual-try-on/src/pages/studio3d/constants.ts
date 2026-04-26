import type { GradientConfig, LightConfig } from './types';

export const DEFAULT_GRADIENT: GradientConfig = {
    enabled: false,
    type: 'linear',
    color1: '#FFFFFF',
    color2: '#3498DB',
    angle: 135,
    stop1: 0,
    stop2: 1,
};

export const DEFAULT_LIGHTS: LightConfig[] = [
    { id: 'key', name: 'Key Light', type: 'directional', x: 4, y: 6, z: 4, intensity: 2.4, color: '#fff4e0', enabled: true },
    { id: 'fill', name: 'Fill Light', type: 'directional', x: -5, y: 1, z: 3, intensity: 0.45, color: '#b8d4ff', enabled: true },
    { id: 'rim', name: 'Rim Light', type: 'directional', x: 0, y: 3, z: -6, intensity: 1.8, color: '#ffffff', enabled: true },
    { id: 'bot', name: 'Bottom Bounce', type: 'point', x: 0, y: -3, z: 2, intensity: 0.45, color: '#ffe8c0', enabled: true },
    { id: 'acc', name: 'Accent Point', type: 'point', x: 3, y: 4, z: 2, intensity: 0.55, color: '#ffeecc', enabled: true },
];

export const CW = 460;
export const CH = 580;

export const FONTS = [
    'Impact', 'Anton', 'Bebas Neue', 'Bangers', 'Black Ops One', 'Russo One',
    'Oswald', 'Teko', 'Rajdhani', 'Prompt', 'Orbitron', 'Krona One',
    'Unbounded', 'Exo 2', 'Black Han Sans', 'Protest Riot',
    'Lobster', 'Fredoka One', 'Pacifico', 'Righteous', 'Luckiest Guy',
    'Lilita One', 'Sigmar One', 'Ultra', 'Comfortaa', 'Josefin Sans',
    'Boogaloo', 'Permanent Marker', 'Kaushan Script',
    'Dancing Script', 'Sacramento', 'Great Vibes', 'Caveat', 'Satisfy',
    'Playfair Display', 'Cinzel', 'Merriweather', 'Libre Baskerville',
    'Fraunces', 'Georgia',
    'Montserrat', 'Poppins', 'Raleway', 'Roboto', 'Lato',
    'Nunito', 'Roboto Condensed', 'Space Grotesk', 'Source Sans 3', 'Ubuntu',
    'Noto Sans',
    'Press Start 2P', 'VT323', 'Silkscreen',
    'Courier New',
];

export const PALETTE_GROUPS = [
    { label: 'Whites', colors: ['#FFFFFF', '#F8F8F8', '#F0EBE0', '#E8E0D0', '#D4C9B8', '#C9B99A'] },
    { label: 'Blacks', colors: ['#0A0A0A', '#1C1C1C', '#2C2C2C', '#3A3A3A', '#4A4A4A', '#666666'] },
    { label: 'Blues', colors: ['#0D1B2A', '#1A2B4A', '#2C3E6B', '#1565C0', '#1E88E5', '#42A5F5', '#90CAF9'] },
    { label: 'Teals', colors: ['#004D40', '#00695C', '#00897B', '#00ACC1', '#26C6DA', '#80DEEA'] },
    { label: 'Greens', colors: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#66BB6A', '#A5D6A7'] },
    { label: 'Yellows', colors: ['#F57F17', '#F9A825', '#FDD835', '#FFEE58', '#FFF176'] },
    { label: 'Oranges', colors: ['#BF360C', '#E64A19', '#FF5722', '#FF7043', '#FF8A65', '#FFAB91'] },
    { label: 'Reds', colors: ['#7F0000', '#B71C1C', '#C62828', '#D32F2F', '#EF5350', '#EF9A9A'] },
    { label: 'Pinks', colors: ['#880E4F', '#AD1457', '#E91E63', '#F06292', '#F48FB1', '#FCE4EC'] },
    { label: 'Purples', colors: ['#4A148C', '#6A1B9A', '#7B1FA2', '#9C27B0', '#CE93D8', '#E1BEE7'] },
    { label: 'Browns', colors: ['#3E2723', '#5D4037', '#795548', '#A1887F', '#BCAAA4'] },
    { label: 'Slates', colors: ['#B0BEC5', '#90A4AE', '#607D8B', '#546E7A', '#37474F'] },
];

export const QUICK_TONE_PRESETS = [
    { name: 'Pastels', colors: ['#FFD6E7', '#FFE8C8', '#FFFACD', '#CAFFBF', '#C5E8FF', '#D0C5FF'] },
    { name: 'Neons', colors: ['#FF0090', '#FF6B00', '#FFE600', '#00FF94', '#00CFFF', '#BF00FF'] },
    { name: 'Earth', colors: ['#5C3A1E', '#8B5E3C', '#A67C52', '#C4A265', '#D4BC8A', '#E8D9BB'] },
    { name: 'Ocean', colors: ['#0A3060', '#1565C0', '#0097A7', '#00BCD4', '#80DEEA', '#E0F7FA'] },
    { name: 'Sunset', colors: ['#4A0080', '#8E0052', '#C62828', '#EF6C00', '#FDD835', '#FFFDE7'] },
];

export const TEX_RES = 1024;
export const DECAL_TEXTURE_MAX = 1024;
export const DECAL_TEXTURE_MIN = 256;
export const DECAL_IMAGE_MAX_SIDE = 1200;

// ── UV canvas dimensions ──
// All models share the same uvConfig shape; adjust per-model if the print area is off.
const DEFAULT_UV = { targetW: 680, targetH: 900, offsetX: 80, offsetY: -100 };

export const MODELS = [
    // ── Men / Tops ──
    { id: 'kyim8',       name: 'Standard Fit',  url: '/models/men/tops/Kyim8blend.glb',              gender: 'men',   category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'cloth10',     name: 'Cloth 10',       url: '/models/men/tops/cloth10.glb',                 gender: 'men',   category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jempir',      name: 'Jumper',         url: '/models/men/tops/Jempir.glb',                  gender: 'men',   category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jempir2',     name: 'Jumper 2',       url: '/models/men/tops/Jempir2.glb',                 gender: 'men',   category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'bezrukavka',  name: 'Bezrukavka',     url: '/models/men/tops/Bezrukavka.glb',              gender: 'men',   category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    // ── Men / Underwear ──
    { id: 'fit3',        name: 'Slim Fit',       url: '/models/men/underwear/fit3.glb',               gender: 'men',   category: 'underwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.5, uvConfig: DEFAULT_UV },
    // ── Men / Bottoms ──
    { id: 'jeans-euro',  name: 'Euro Blue Jeans',url: '/models/men/bottoms/jeansblend2.glb',          gender: 'men',   category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.4, uvConfig: DEFAULT_UV },
    { id: 'pants-1',     name: 'Штаны 1',        url: '/models/men/bottoms/Штаны1.glb',               gender: 'men',   category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.4, uvConfig: DEFAULT_UV },
    { id: 'shalbar-2',   name: 'Шалбар 2',       url: '/models/men/bottoms/Шалбар2.glb',              gender: 'men',   category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.4, uvConfig: DEFAULT_UV },
    { id: 'shalbar-4',   name: 'Шалбар 4',       url: '/models/men/bottoms/шалбар4.glb',              gender: 'men',   category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.4, uvConfig: DEFAULT_UV },
    { id: 'shorts-1',    name: 'Шорты',          url: '/models/men/bottoms/Шорты.glb',                gender: 'men',   category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.4, uvConfig: DEFAULT_UV },
    // ── Men / Outerwear ──
    { id: 'coat-men1',   name: 'Coat',           url: '/models/men/outerwear/coat2.glb',              gender: 'men',   category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jacket-men',  name: 'Jacket',         url: '/models/men/outerwear/Jacket2.glb',            gender: 'men',   category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'coat-men2',   name: 'Coat v2',        url: '/models/men/outerwear/coat2.glb',              gender: 'men',   category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jacket-sport',name: 'Sport Jacket',   url: '/models/men/outerwear/jakcketsport.glb',       gender: 'men',   category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jacket-moda', name: 'Moda Jacket',    url: '/models/men/outerwear/Jacketmoda.glb',         gender: 'men',   category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    // ── Men / Footwear ──
    { id: 'shoes-men-1', name: 'Shoes Men 1',    url: '/models/men/footwear/shoesmen.glb',            gender: 'men',   category: 'footwear',  flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'shoes-men-2', name: 'Shoes Men 2',    url: '/models/men/footwear/shoesmen2.glb',           gender: 'men',   category: 'footwear',  flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'shoes-men-3', name: 'Shoes Men 3',    url: '/models/men/footwear/shoesmen3.glb',           gender: 'men',   category: 'footwear',  flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    // ── Women / Outerwear ──
    { id: 'coat-girl-2', name: 'Coat Girl 2',    url: '/models/women/outerwear/coatgirl2.glb',        gender: 'women', category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'coat-girl-3', name: 'Coat Girl 3',    url: '/models/women/outerwear/coatgirl3.glb',        gender: 'women', category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jacket-girl-1',name:'Jacket Girl',    url: '/models/women/outerwear/jacketgirl.glb',       gender: 'women', category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jacket-girl-2',name:'Jacket Girl 2',  url: '/models/women/outerwear/jacketgirl2.glb',      gender: 'women', category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'jacket-girl-3',name:'Jacket Girl 3',  url: '/models/women/outerwear/jacketgirl3.glb',      gender: 'women', category: 'outerwear', flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    // ── Women / Tops ──
    { id: 'shirt-girl-1',name: 'Shirt Girl',     url: '/models/women/tops/shirtgirl.glb',             gender: 'women', category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'shirt-girl-2',name: 'Shirt Girl 2',   url: '/models/women/tops/shirtgirl2.glb',            gender: 'women', category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'shirt-girl-3',name: 'Shirt Girl 3',   url: '/models/women/tops/shirtgirl3.glb',            gender: 'women', category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'shirt-girl-4',name: 'Shirt Girl 4',   url: '/models/women/tops/shirtgirl4.glb',            gender: 'women', category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'shirt-girl-5',name: 'Shirt Girl 5',   url: '/models/women/tops/shirtgirl5.glb',            gender: 'women', category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    { id: 'shirt-girl-6',name: 'Shirt Girl 6',   url: '/models/women/tops/shirtgirl6.glb',            gender: 'women', category: 'tops',      flipNormals: false, fixRotation: [0,0,0] as [number,number,number], uvConfig: DEFAULT_UV },
    // ── Women / Bottoms ──
    { id: 'trousers-girl-1',name:'Trousers Girl 1',url:'/models/women/bottoms/trousersgirl.glb',      gender: 'women', category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.8, uvConfig: DEFAULT_UV },
    { id: 'trousers-girl-2',name:'Trousers Girl 2',url:'/models/women/bottoms/trousersgirl2.glb',     gender: 'women', category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.8, uvConfig: DEFAULT_UV },
    { id: 'trousers-girl-3',name:'Trousers Girl 3',url:'/models/women/bottoms/trousersgirl3.glb',     gender: 'women', category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.8, uvConfig: DEFAULT_UV },
    { id: 'trousers-girl-4',name:'Trousers Girl 4',url:'/models/women/bottoms/trousersgirl4.glb',     gender: 'women', category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.8, uvConfig: DEFAULT_UV },
    { id: 'trousers-girl-5',name:'Trousers Girl 5',url:'/models/women/bottoms/trousersgirl5.glb',     gender: 'women', category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.8, uvConfig: DEFAULT_UV },
    { id: 'trousers-girl-6',name:'Trousers Girl 6',url:'/models/women/bottoms/trousersgirl6.glb',     gender: 'women', category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.8, uvConfig: DEFAULT_UV },
    { id: 'trousers-girl-7',name:'Trousers Girl 7',url:'/models/women/bottoms/trousersgirl7.glb',     gender: 'women', category: 'bottoms',   flipNormals: false, fixRotation: [0,0,0] as [number,number,number], modelScale: 0.8, uvConfig: DEFAULT_UV },
    // ── Women / Underwear ──
    { id: 'underpants-girl-1',name:'Underpants Girl 1',url:'/models/women/underwear/underpantsgirl.glb', gender:'women', category:'underwear', flipNormals:false, fixRotation:[0,0,0] as [number,number,number], modelScale:0.5, uvConfig:DEFAULT_UV },
    { id: 'underpants-girl-2',name:'Underpants Girl 2',url:'/models/women/underwear/underpants2.glb',    gender:'women', category:'underwear', flipNormals:false, fixRotation:[0,0,0] as [number,number,number], modelScale:0.5, uvConfig:DEFAULT_UV },
    { id: 'underpants-girl-3',name:'Underpants Girl 3',url:'/models/women/underwear/underpants3.glb',    gender:'women', category:'underwear', flipNormals:false, fixRotation:[0,0,0] as [number,number,number], modelScale:0.5, uvConfig:DEFAULT_UV },
    // ── Women / Dresses ──
    { id: 'dress-girl-1',name:'Dress Girl 1',    url:'/models/women/dresses/dressgirl.glb',           gender:'women', category:'dresses',   flipNormals:false, fixRotation:[0,0,0] as [number,number,number], uvConfig:DEFAULT_UV },
    { id: 'dress-girl-2',name:'Dress Girl 2',    url:'/models/women/dresses/dressgirl2.glb',          gender:'women', category:'dresses',   flipNormals:false, fixRotation:[0,0,0] as [number,number,number], uvConfig:DEFAULT_UV },
    { id: 'dress-girl-3',name:'Dress Girl 3',    url:'/models/women/dresses/dressgirl3.glb',          gender:'women', category:'dresses',   flipNormals:false, fixRotation:[0,0,0] as [number,number,number], uvConfig:DEFAULT_UV },
    { id: 'dress-4',     name:'Dress 4',         url:'/models/women/dresses/dress4.glb',              gender:'women', category:'dresses',   flipNormals:false, fixRotation:[0,0,0] as [number,number,number], uvConfig:DEFAULT_UV },
    // ── Women / Footwear ──
    { id: 'shoes-girl-1',name:'Shoes Girl 1',    url:'/models/women/footwear/girlshoes.glb',          gender:'women', category:'footwear',  flipNormals:false, fixRotation:[0,0,0] as [number,number,number], uvConfig:DEFAULT_UV },
    { id: 'shoes-girl-2',name:'Shoes Girl 2',    url:'/models/women/footwear/girlshoes2.glb',         gender:'women', category:'footwear',  flipNormals:false, fixRotation:[0,0,0] as [number,number,number], uvConfig:DEFAULT_UV },
    { id: 'shoes-girl-3',name:'Shoes Girl 3',    url:'/models/women/footwear/girlshoes3.glb',         gender:'women', category:'footwear',  flipNormals:false, fixRotation:[0,0,0] as [number,number,number], uvConfig:DEFAULT_UV },
];
// NOTE: Do NOT preload all models — it causes massive lag with 25+ heavy GLBs.
// Smart lazy preloading is done in Studio3D based on active model + category neighbors.

export const CATEGORY_DATA = {
    men: [
        { id: 'outerwear', name: { ru: 'Верхняя одежда', en: 'Outerwear' }, icon: '🧥' },
        { id: 'tops',      name: { ru: 'Верх (Tops)',    en: 'Tops'      }, icon: '👕' },
        { id: 'bottoms',   name: { ru: 'Низ (Bottoms)',  en: 'Bottoms'   }, icon: '👖' },
        { id: 'underwear', name: { ru: 'Нижнее бельё',  en: 'Underwear' }, icon: '🩲' },
        { id: 'footwear',  name: { ru: 'Обувь',         en: 'Footwear'  }, icon: '👟' },
    ],
    women: [
        { id: 'outerwear', name: { ru: 'Верхняя одежда',     en: 'Outerwear'       }, icon: '🧥' },
        { id: 'tops',      name: { ru: 'Верх (Tops)',        en: 'Tops'            }, icon: '👚' },
        { id: 'bottoms',   name: { ru: 'Низ (Bottoms)',      en: 'Bottoms'         }, icon: '👖' },
        { id: 'dresses',   name: { ru: 'Платья и костюмы',   en: 'Dresses & Suits' }, icon: '👗' },
        { id: 'underwear', name: { ru: 'Нижнее бельё',       en: 'Underwear'       }, icon: '👙' },
        { id: 'footwear',  name: { ru: 'Обувь',              en: 'Footwear'        }, icon: '👠' },
    ],
} as const;

export const FABRIC_TEXTURES = [
    { id: 'none',      name: 'None',       src: '',                                                                                  icon: '🚫' },
    { id: 'linen4k',   name: 'Linen 4K',   src: '/cloth textures/rough_linen_4k/textures/rough_linen_diff_4k.jpg',                  icon: '🪢' },
    { id: 'velvet4k',  name: 'Velvet 4K',  src: '/cloth textures/velour_velvet_4k/textures/velour_velvet_diff_4k.jpg',              icon: '✨' },
    { id: 'crepe4k',   name: 'Satin 4K',   src: '/cloth textures/crepe_satin_4k/textures/crepe_satin_diff_4k.jpg',                  icon: '👗' },
    { id: 'denim4k',   name: 'Denim 4K',   src: '/cloth textures/denim_fabric_06_4k/textures/denim_fabric_06_diff_4k.jpg',          icon: '👖' },
    { id: 'leather4k', name: 'Leather 4K', src: '/cloth textures/fabric_leather_01_4k/textures/fabric_leather_01_diff_4k.jpg',      icon: '👞' },
    { id: 'fleece4k',  name: 'Fleece 4K',  src: '/cloth textures/knitted_fleece_4k/textures/knitted_fleece_diff_4k.jpg',            icon: '☁️' },
    { id: 'terry4k',   name: 'Terry 4K',   src: '/cloth textures/terry_cloth_4k/textures/terry_cloth_diff_4k.jpg',                  icon: '🛁' },
];
