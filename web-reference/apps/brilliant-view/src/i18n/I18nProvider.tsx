import { useLocale } from '~/stores/system';
import React, { useEffect, useMemo, useState } from 'react';
import { I18nContext } from './I18nContext';

type MessagePrimitive = string | number | boolean | null;
interface MessageValues {
    [key: string]: MessagePrimitive | MessageValues;
}
type MessageValue = MessagePrimitive | MessageValues;
type Messages = MessageValues;

function isMessageValues(value: unknown): value is MessageValues {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getByPath(obj: MessageValues, path: string): MessageValue | undefined {
    return path.split('.').reduce<MessageValue | undefined>((acc, part) => {
        if (!isMessageValues(acc)) {
            return undefined;
        }

        return acc[part];
    }, obj);
}

async function loadMessages(locale: string): Promise<Messages> {
    switch (locale) {
        case 'nb':
            return (await import('~/locales/nb/common.json')).default;
        case 'en':
        default:
            return (await import('~/locales/en/common.json')).default;
    }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const locale = useLocale();
    const [messages, setMessages] = useState<Messages | null>(null);
    const [onLoadError, setOnLoadError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            setOnLoadError(null);

            try {
                const m = await loadMessages(locale);
                if (!cancelled) setMessages(m);
            } catch (error) {
                try {
                    const m = await loadMessages('en');
                    if (!cancelled) {
                        setMessages(m);
                        setOnLoadError(error);
                    }
                } catch (error2) {
                    if (!cancelled) {
                        setMessages(null);
                        setOnLoadError(error2);
                    }
                }
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [locale]);

    const value = useMemo(() => {
        return {
            locale,
            t: (key: string, vars?: Record<string, string | number>) => {
                const v = messages ? getByPath(messages, key) : undefined;
                if (typeof v !== 'string') return key;
                if (!vars) return v;
                return v.replace(/\{(\w+)\}/g, (_, key: string) =>
                    String(vars[key] ?? `{${key}}`)
                );
            },
        };
    }, [locale, messages]);

    if (!messages)
        return (
            <div>
                <p>Loading language..</p>
                {onLoadError ? (
                    <p>If this persists, try refreshing the page</p>
                ) : null}
            </div>
        );

    return (
        <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
}
