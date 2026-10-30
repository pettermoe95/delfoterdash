import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';

const skeletonStyles = cva('animate-pulse rounded-md bg-quaternary', {
    variants: {
        shape: {
            circle: 'aspect-square rounded-full',
            square: 'aspect-square',
            rectangle: '',
        },
    },
    defaultVariants: {
        shape: 'rectangle',
    },
});

type SkeletonProps = VariantProps<typeof skeletonStyles> &
    React.HTMLAttributes<HTMLDivElement>;
export function Skeleton({ className, shape, ...props }: SkeletonProps) {
    const skeletonClasses = skeletonStyles({ shape });
    return <div className={cn(skeletonClasses, className)} {...props} />;
}
