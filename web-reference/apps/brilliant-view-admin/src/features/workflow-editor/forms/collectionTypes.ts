import type { ReactNode } from 'react';
import type { z } from 'zod';

export type CollectionFieldProps = {
    schema: z.ZodArray<z.ZodTypeAny> | z.ZodRecord;
    value: unknown;
    ordered?: boolean;
    onChange: (value: unknown) => void;
    render: (
        schema: z.ZodTypeAny,
        value: unknown,
        key: string,
        onChange: (value: unknown) => void
    ) => ReactNode;
};
