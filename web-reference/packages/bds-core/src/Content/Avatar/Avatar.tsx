import * as RadixAvatar from '@radix-ui/react-avatar';
import { cva } from 'class-variance-authority';
import React from 'react';
import { Icon } from '../../Theme';
import { cn } from '../../utils';
import styles from './Avatar.module.scss';

const sizeVariations = {
    xs: styles['AvatarRoot--xs'],
    md: styles['AvatarRoot--md'],
    sm: styles['AvatarRoot--sm'],
    lg: styles['AvatarRoot--lg'],
} as const;

const avatarStyles = cva(styles.AvatarRoot, {
    variants: {
        size: sizeVariations,
    },
    defaultVariants: {
        size: 'md',
    },
});

export type AvatarSize = keyof typeof sizeVariations;

type AvatarProps = {
    name?: string;
    src?: string;
    size?: AvatarSize;
} & RadixAvatar.AvatarProps;

export const Avatar = React.forwardRef<
    React.ElementRef<typeof RadixAvatar.Root>,
    AvatarProps
>(({ name, src, size, className, ...props }, ref) => {
    return (
        <RadixAvatar.Root
            ref={ref}
            className={cn(avatarStyles({ size }), className)}
            {...props}
        >
            <RadixAvatar.Image
                className={styles.AvatarImage}
                src={src}
                alt={name ?? 'User Avatar'}
            />
            <RadixAvatar.Fallback
                className={styles.AvatarFallback}
                delayMs={600}
            >
                <AvatarFallbackContent name={name} />
            </RadixAvatar.Fallback>
        </RadixAvatar.Root>
    );
});

function AvatarFallbackContent({ name }: Pick<AvatarProps, 'name'>) {
    if (!name) return <Icon icon="bv:user" />;
    const nameParts = name.split(' ');
    const initials = [nameParts[0], nameParts[nameParts.length - 1]]
        .filter((part): part is string => Boolean(part))
        .map((part) => part.charAt(0))
        .join('');
    return <div className={styles.AvatarInitials}>{initials}</div>;
}
