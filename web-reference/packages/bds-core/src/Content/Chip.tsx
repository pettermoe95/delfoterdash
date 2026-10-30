import { Icon } from '@iconify/react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '../utils';

export const chipColors = [
    'brand',
    'secondary',
    'success',
    'warning',
    'error',
] as const;
export type ChipColor = (typeof chipColors)[number];
export const chipSizes = ['xs', 'sm', 'md'] as const;
export type ChipSize = (typeof chipSizes)[number];

const chipStyles = cva('flex w-min items-center gap-xs rounded-full border', {
    variants: {
        color: {
            brand: 'border-brand-primary-solid bg-brand-primary text-brand-secondary',
            secondary:
                'border-brand-secondary-solid bg-brand-secondary-alt text-brand-secondary-alt',
            success:
                'border-success-solid bg-success-primary text-success-primary',
            warning:
                'border-warning-solid bg-warning-primary text-warning-primary',
            error: 'border-error-solid bg-error-primary text-error-primary',
        } satisfies Record<ChipColor, string>,
        size: {
            xs: 'px-sm py-xxs bv-text-font-xs-medium',
            sm: 'px-lg py-xs bv-text-font-xs-medium',
            md: 'px-xl py-xs bv-text-font-sm-medium',
        } satisfies Record<ChipSize, string>,
    },
    defaultVariants: {
        color: 'secondary',
        size: 'sm',
    },
});

export type ChipProps = VariantProps<typeof chipStyles> & {
    text: string;
    className?: string;
    icon?: string;
};

export function Chip({ className, text, color, size, icon }: ChipProps) {
    const badgeStyle = chipStyles({ color, size });
    return (
        <div className={cn(badgeStyle, className)}>
            {icon && <Icon icon={icon} />}
            {capitalizeFirstLetter(text)}
        </div>
    );
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
