import type { ReactNode } from 'react';

export function getSearchableLabel(label: ReactNode): string {
    return typeof label === 'string' || typeof label === 'number'
        ? String(label)
        : '';
}
