import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from './api/client';

interface OutfitState {
    // Auth State
    user: { name: string, email: string, points?: number, level?: string, role?: string } | null
    token: string | null
    login: (email: string, password?: string) => Promise<boolean>
    register: (name: string, email: string, password?: string) => Promise<boolean>
    verify: (email: string, code: string) => Promise<boolean>
    logout: () => void
}

export const useOutfitStore = create<OutfitState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        try {
          const res = await authAPI.login(email, password || '');
          set({ user: res.user, token: res.token });
          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      },
      register: async (name, email, password) => {
        try {
          const res = await authAPI.register(email, password || '', name);
          set({ user: res.user, token: res.token });
          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      },
      verify: async (_email, _code) => {
        // Mock verification step for UI flow
        return true;
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'outfit-storage-v2' }
  )
);
