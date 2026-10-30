import { useLocale } from '~/stores/system';
import { createContext, useContext } from 'react';

type I18nContextValue = {
    locale: string;
    t: (key: string, vars?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useLocalize() {
    const ctx = useContext(I18nContext);
    if (!ctx)
        throw new Error('useTranslation must be used within I18nProvider');
    return ctx.t;
}

export function useLocaleValue() {
    return useLocale();
}
