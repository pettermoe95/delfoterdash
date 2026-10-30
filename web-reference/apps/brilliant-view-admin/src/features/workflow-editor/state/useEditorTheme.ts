import { useState } from 'react';

export type EditorTheme = 'light' | 'dark';
const preferenceKey = 'workflow-editor-v2-theme';

export function useEditorTheme() {
    const [theme, setTheme] = useState<EditorTheme>(() => {
        try {
            const saved = localStorage.getItem(preferenceKey);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch {
            /* Storage can be unavailable in private browser contexts. */
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    });
    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try {
            localStorage.setItem(preferenceKey, next);
        } catch {
            /* The theme still works without persisted preferences. */
        }
    };
    return { theme, toggleTheme };
}
