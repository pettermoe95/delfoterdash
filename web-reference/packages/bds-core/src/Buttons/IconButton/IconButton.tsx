import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Icon } from '../../Theme';
import type { AsChildProps } from '../../Utility';
import { Slot, Slottable } from '../../Utility';
import { baseButtonStyles } from '../BaseButton';
import styles from './IconButton.module.scss';

const iconButtonStyles = cva(styles.IconButton, {
    variants: {
        size: {
            xs: styles['IconButton--xs'],
            sm: styles['IconButton--sm'],
            md: styles['IconButton--md'],
            lg: styles['IconButton--lg'],
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

type IconButtonProps = AsChildProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>
> & {
    disabled?: boolean;
    className?: string;
} & VariantProps<typeof baseButtonStyles> &
    VariantProps<typeof iconButtonStyles> & {
        icon: string;
    };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        { asChild, children, icon, disabled, variant, color, size, ...props },
        forwardedRef
    ) => {
        const Component = asChild ? Slot : 'button';
        const baseClasses = baseButtonStyles({ variant, color, disabled });
        const iconButtonClasses = iconButtonStyles({ size });

        return (
            <Component
                className={cx(baseClasses, iconButtonClasses)}
                disabled={disabled}
                {...props}
                ref={forwardedRef}
            >
                <Icon icon={icon} />
                <Slottable>{children}</Slottable>
            </Component>
        );
    }
);
IconButton.displayName = 'IconButton';
