import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

// The cache intentionally stores contexts with different value types. Each
// lookup is narrowed to the caller's ContextValue using its cache key.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contextCache = new Map<string, React.Context<any>>();

/**
 * Create a context that enforces that components are only used within the Provider
 *
 * Primarily for use with component composition (e.g. Table.Row, Table.Cell)
 *
 * @param errorMessage - The error message that is thrown when used outside the provider
 * @returns
 */
export function createSafeContext<ContextValue>(errorMessage: string) {
    // errorMessage as cache key
    const cacheKey = errorMessage;

    let Context = contextCache.get(cacheKey) as
        | React.Context<ContextValue | null>
        | undefined;
    if (!Context) {
        Context = createContext<ContextValue | null>(null);
        contextCache.set(cacheKey, Context);
    }
    const useSafeContext = () => {
        const ctx = useContext(Context);

        if (ctx === null) throw new Error(errorMessage);

        return ctx;
    };

    const Provider = ({
        children,
        value,
    }: PropsWithChildren<{ value: ContextValue }>) => (
        <Context.Provider value={value}>{children}</Context.Provider>
    );

    return [Provider, useSafeContext] as const;
}
