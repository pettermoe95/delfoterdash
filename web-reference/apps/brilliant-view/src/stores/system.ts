import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect, useLayoutEffect } from 'react';

/* =Start= Global Theme State === */
export type GlobalThemeKey = 'light' | 'dark' | 'system';

const globalThemeAtom = atomWithStorage<GlobalThemeKey>('theme', 'system');
const getInitialSystemTheme = (): 'light' | 'dark' => {
    if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
        return 'dark';
    }
    return 'light';
};

const systemThemeAtom = atom<'light' | 'dark'>(getInitialSystemTheme());

const activeThemeAtom = atom((get) => {
    const theme = get(globalThemeAtom);
    if (theme === 'system') return get(systemThemeAtom);
    return theme;
});

export const useGlobalTheme = () => useAtom(globalThemeAtom);
export const useActiveTheme = () => useAtomValue(activeThemeAtom);

export function useSyncSystemTheme() {
    const setSystemTheme = useSetAtom(systemThemeAtom);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const update = () => setSystemTheme(media.matches ? 'dark' : 'light');

        // sync immediately in case the system theme changed before mount
        update();

        media.addEventListener?.('change', update);
        return () => media.removeEventListener?.('change', update);
    }, [setSystemTheme]);
}
/* =End= Global Theme State === */

/* =Start= Global Locale State === */
const LOCALE_KEYS = ['en', 'nb'] as const;
export type LocaleKey = (typeof LOCALE_KEYS)[number];

const getInitialSystemLocale = (): LocaleKey => {
    if (typeof window === 'undefined') return 'en'; //Defaulting to english outside of browser rendering

    //Split and take only the first part of localization key (en-US / en-UK => en, nb-NO => "nb", etc.)
    const lang = window.navigator.language.split('-')[0];

    if ((LOCALE_KEYS as readonly string[]).includes(lang)) {
        return lang as LocaleKey;
    }

    return 'en';
};

const globalLocaleAtom = atomWithStorage<LocaleKey>(
    'locale',
    getInitialSystemLocale()
);

export const useGlobalLocale = () => useAtom(globalLocaleAtom);
export const useLocale = () => useAtomValue(globalLocaleAtom);
/* =End= Global Locale State === */

/* =Start= Global Layout State === */
export type GlobalLayoutOption =
    | 'default'
    | 'minified'
    | 'fullscreen'
    | 'dashboard-edit'
    | 'dashboard'
    | 'page-layout';

const globalLayoutAtom = atom<GlobalLayoutOption>('default');
export const useGlobalLayout = () => useAtomValue(globalLayoutAtom);
export const useGlobalLayoutMatch = (
    option: GlobalLayoutOption | GlobalLayoutOption[]
) => {
    const globalLayout = useGlobalLayout();
    if (typeof option === 'string') {
        return option === globalLayout;
    }
    return option.includes(globalLayout);
};

export function useAutoLayout(option: GlobalLayoutOption) {
    const setLayout = useSetAtom(globalLayoutAtom);

    useLayoutEffect(() => {
        setLayout(option);

        return () => {
            setLayout('default');
        };
    }, [option, setLayout]);
}
export function useLayoutBackground() {
    const editMode = useGlobalLayoutMatch('dashboard-edit');
    return editMode ? 'bg-brand-primary-alt' : 'bg-secondary';
}

export function useLayoutConfig() {
    const globalLayout = useGlobalLayout();
    const isDefaultLayout = useGlobalLayoutMatch([
        'default',
        'minified',
        'page-layout',
    ]);
    const isEditMode = useGlobalLayoutMatch('dashboard-edit');
    return {
        backgroundClass: isEditMode ? 'bg-brand-primary-alt' : 'bg-secondary',
        sidebar: {
            minify: ['minified', 'dashboard'].includes(globalLayout),
            hide: ['fullscreen', 'dashboard-edit'].includes(globalLayout),
        },
        mobileNav: {
            minify: ['minified', 'dashboard'].includes(globalLayout),
            hide: ['fullscreen', 'dashboard-edit'].includes(globalLayout),
        },
        showAppHeader: ['default', 'page-layout'].includes(globalLayout),
        layoutPadding: isDefaultLayout
            ? {
                  horizontal: 'px-3 md:px-[var(--layout-padding)]',
                  vertical: 'py-[var(--layout-padding)]',
              }
            : undefined,
        maxWidthClass: isDefaultLayout ? 'max-w-screen-wide' : 'max-w-full',
    };
}
/* =End= Global Layout State === */
