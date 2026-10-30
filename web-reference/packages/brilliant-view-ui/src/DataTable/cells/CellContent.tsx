import { createSafeContext } from '@brilliant/bds-core';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { PropsWithChildren } from 'react';
import { cn } from '../../utils';

const cellContentStyles = cva('flex w-auto items-center gap-sm', {
    variants: {
        hierarchy: {
            primary: 'text-primary bv-text-font-md-regular',
            secondary: 'text-secondary bv-text-font-sm-regular',
            tertiary: 'text-quaternary bv-text-font-xs-regular',
        },
        truncate: {
            true: [
                'truncate',
                'hover:overflow-visible hover:whitespace-normal',
            ],
        },
    },
    defaultVariants: {
        hierarchy: 'secondary',
    },
});

type CellContentVariantProps = VariantProps<typeof cellContentStyles>;

type CellContentProps = CellContentVariantProps &
    PropsWithChildren & {
        className?: string;
    };

export const [CellContentProvider, useCellContent] =
    createSafeContext<CellContentVariantProps>(
        'No cell content component found in the tree'
    );

export function CellContent({
    hierarchy,
    truncate,
    children,
    className,
}: CellContentProps) {
    const contentClasses = cellContentStyles({ hierarchy, truncate });

    return (
        <CellContentProvider value={{ hierarchy, truncate }}>
            <div className={cn(contentClasses, className)}>{children}</div>
        </CellContentProvider>
    );
}
