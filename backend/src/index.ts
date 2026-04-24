import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import * as jsonwebtoken from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { readMaleSceneStore, writeMaleSceneStore } from './maleSceneStore';

const prisma = new PrismaClient();
const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.ALLOWED_ORIGIN || '',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-gravity-key-2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Asylzhan1999';

const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: string };
        (req as any).userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { role?: string };

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    } catch {
        return res.status(401).json({ error: 'Invalid admin token' });
    }
};

app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword },
        });

        const token = jsonwebtoken.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, level: user.level, role: user.role } });
    } catch {
        res.status(400).json({ error: 'Email already exists or invalid data' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jsonwebtoken.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, level: user.level, role: user.role } });
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body ?? {};

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jsonwebtoken.sign({ role: 'admin', username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token, user: { username: ADMIN_USERNAME } });
});

app.get('/api/scene-presets/men', async (_req, res) => {
    try {
        const store = await readMaleSceneStore();
        res.json(store);
    } catch (error) {
        console.error('Failed to read men scene presets', error);
        res.status(500).json({ error: 'Failed to read men scene presets' });
    }
});

app.get('/api/admin/scene-presets/men', authenticateAdmin, async (_req, res) => {
    try {
        const store = await readMaleSceneStore();
        res.json(store);
    } catch (error) {
        console.error('Failed to read admin men scene presets', error);
        res.status(500).json({ error: 'Failed to read men scene presets' });
    }
});

app.put('/api/admin/scene-presets/men', authenticateAdmin, async (req, res) => {
    try {
        const nextStore = {
            ...req.body,
            updatedAt: new Date().toISOString(),
        };

        const saved = await writeMaleSceneStore(nextStore);
        res.json(saved);
    } catch (error) {
        console.error('Failed to save men scene presets', error);
        res.status(500).json({ error: 'Failed to save men scene presets' });
    }
});

app.get('/api/users/me', authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: (req as any).userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        level: user.level,
        points: user.points,
        role: user.role,
    });
});

app.get('/api/designs', authenticate, async (req, res) => {
    const designs = await prisma.design.findMany({ where: { userId: (req as any).userId } });
    res.json(designs);
});

app.post('/api/designs', authenticate, async (req, res) => {
    const { name, textureData } = req.body;
    const design = await prisma.design.create({
        data: { name, textureData, userId: (req as any).userId },
    });
    res.json(design);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`GRAVITY Backend running on http://localhost:${PORT}`);
});
