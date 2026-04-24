import axios from 'axios';
import type { MaleSceneStore } from '../features/maleScene/config';

// Базовый URL: локально localhost:5000, на сервере — из VITE_API_URL
export const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем автоматический JWT токен ко всем запросам,
// если он сохранен в хранилище (localStorage)
apiClient.interceptors.request.use((config) => {
  try {
    const rawStorage = localStorage.getItem('outfit-storage-v2');
    if (rawStorage) {
      const state = JSON.parse(rawStorage).state;
      if (state && state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch (err) {
    console.error('Error parsing token from local storage', err);
  }
  return config;
});

// ─── API МЕТОДЫ ДЛЯ ВЗАИМОДЕЙСТВИЯ С БЭКЕНДОМ ───

export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data; // { token, user }
  },
  register: async (email: string, password: string, name: string) => {
    const res = await apiClient.post('/auth/register', { email, password, name });
    return res.data; // { token, user }
  },
  getMe: async () => {
    const res = await apiClient.get('/users/me');
    return res.data; // { id, email, name, level, points }
  }
};

export const adminSceneAPI = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/admin/login', { username, password });
    return res.data as { token: string; user: { username: string } };
  },
  getMenScene: async () => {
    const res = await apiClient.get('/scene-presets/men');
    return res.data as MaleSceneStore;
  },
  getMenSceneForAdmin: async (token: string) => {
    const res = await apiClient.get('/admin/scene-presets/men', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as MaleSceneStore;
  },
  saveMenScene: async (token: string, scene: MaleSceneStore) => {
    const res = await apiClient.put('/admin/scene-presets/men', scene, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as MaleSceneStore;
  },
};
