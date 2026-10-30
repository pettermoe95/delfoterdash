import type React from 'react';

export type AsChildProps<DefaultElementProps> =
    | ({ asChild?: false } & DefaultElementProps)
    | { asChild: true; children: React.ReactNode };

// Re-Export to keep all AsChild functionality in one file
export { Slot, Slottable } from '@radix-ui/react-slot';
