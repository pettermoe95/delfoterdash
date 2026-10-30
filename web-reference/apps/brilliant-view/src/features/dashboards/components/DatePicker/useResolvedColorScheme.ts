import { useEffect, useMemo, useState } from 'react';

export type ColorScheme = 'light' | 'dark';

function getSystemScheme(): ColorScheme {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function useSystemColorScheme(): ColorScheme {
    const [scheme, setScheme] = useState<ColorScheme>(() => getSystemScheme());

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent | MediaQueryList) => {
            const match =
                'matches' in e ? e.matches : (e as MediaQueryList).matches;
            setScheme(match ? 'dark' : 'light');
        };
        // Initial sync in case it changed before mount
        handler(mql);
        // Modern browsers
        if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', handler as (ev: Event) => void);
            return () =>
                mql.removeEventListener(
                    'change',
                    handler as (ev: Event) => void
                );
        }
    }, []);

    return scheme;
}

export function useResolvedColorScheme(
    userPref: 'light' | 'dark' | 'system' | null | undefined
): ColorScheme {
    const system = useSystemColorScheme();
    return useMemo(() => {
        if (userPref === 'dark' || userPref === 'light') return userPref;
        return system;
    }, [userPref, system]);
}
