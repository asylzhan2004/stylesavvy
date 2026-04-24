import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Lang, t as translate } from './translations';

interface LangState {
    lang: Lang;
    setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
    persist(
        (set) => ({
            lang: 'ru',
            setLang: (lang) => set({ lang }),
        }),
        { name: 'gravity-lang' }
    )
);

// Convenience hook
export function useT() {
    const lang = useLangStore((s) => s.lang);
    return (key: string) => translate(key, lang);
}
