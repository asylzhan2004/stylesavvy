import { useState, useCallback } from 'react';
import type { LightConfig } from '../types';
import { DEFAULT_LIGHTS } from '../constants';

export function useLighting() {
    const [lights, setLights] = useState<LightConfig[]>(DEFAULT_LIGHTS);
    const [expandedLight, setExpandedLight] = useState<string | null>(null);

    const updLight = useCallback((id: string, u: Partial<LightConfig>) =>
        setLights(p => p.map(l => l.id === id ? { ...l, ...u } : l)), []);

    const delLight = useCallback((id: string) =>
        setLights(p => p.filter(l => l.id !== id)), []);

    const addLight = useCallback(() => {
        const id = Date.now().toString();
        setLights(p => [...p, {
            id, name: 'New Light', type: 'point',
            x: 0, y: 3, z: 3, intensity: 1, color: '#ffffff', enabled: true,
        }]);
        setExpandedLight(id);
    }, []);

    const resetLights = useCallback(() => setLights(DEFAULT_LIGHTS), []);

    return { lights, expandedLight, setExpandedLight, updLight, delLight, addLight, resetLights };
}
