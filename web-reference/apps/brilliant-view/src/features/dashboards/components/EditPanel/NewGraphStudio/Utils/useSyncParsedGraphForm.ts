import { useEffect, useRef } from 'react';
import type { UseFormWatch } from 'react-hook-form';
import type { z } from 'zod';

type SyncParsedGraphFormOptions<TSchema extends z.AnyZodObject> = {
    watch: UseFormWatch<z.output<TSchema>>;
    schema: TSchema;
    onChange: (value: z.output<TSchema>) => void;
    transform?: (value: z.output<TSchema>) => z.output<TSchema>;
};

export function useSyncParsedGraphForm<TSchema extends z.AnyZodObject>({
    watch,
    schema,
    onChange,
    transform,
}: SyncParsedGraphFormOptions<TSchema>) {
    const lastSyncedRef = useRef<string | null>(null);

    useEffect(() => {
        const syncIfChanged = (value: unknown) => {
            const parsed = schema.safeParse(value);
            if (!parsed.success) return;

            const nextValue = transform ? transform(parsed.data) : parsed.data;
            const serialized = JSON.stringify(nextValue);
            if (serialized === lastSyncedRef.current) return;

            lastSyncedRef.current = serialized;
            onChange(nextValue);
        };

        syncIfChanged(watch());
        const subscription = watch((value) => syncIfChanged(value));
        return () => subscription.unsubscribe();
    }, [onChange, schema, transform, watch]);
}
