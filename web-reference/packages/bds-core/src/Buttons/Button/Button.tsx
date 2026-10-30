import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { AsChildProps } from '../../Utility';
import { Slot, Slottable } from '../../Utility';
import { baseButtonStyles } from '../BaseButton';
import styles from './Button.module.scss';
import { ButtonIcon } from './ButtonIcon';

export type ButtonSize = 'sm' | 'md' | 'lg';
export const buttonStyles = cva(styles.Button, {
    variants: {
        size: {
            sm: styles['Button--sm'] ?? '',
            md: styles['Button--md'] ?? '',
            lg: styles['Button--lg'] ?? '',
        } satisfies Record<ButtonSize, string>,
    },
    defaultVariants: {
        size: 'md',
    },
});

export type ButtonProps = AsChildProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>
> & {
    disabled?: boolean;
    className?: string;
    isLoading?: boolean;
} & VariantProps<typeof buttonStyles> &
    VariantProps<typeof baseButtonStyles> & {
        leftIcon?: string;
        rightIcon?: string;
    };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            asChild,
            children,
            className,
            size,
            disabled,
            variant,
            color,
            leftIcon,
            rightIcon,
            isLoading,
            ...props
        },
        forwardedRef
    ) => {
        const Component = asChild ? Slot : 'button';
        const buttonClasses = buttonStyles({ size });
        const baseClasses = baseButtonStyles({
            disabled: disabled || isLoading,
            variant,
            color,
        });
        return (
            <Component
                ref={forwardedRef}
                className={cx(baseClasses, buttonClasses, className)}
                disabled={disabled || isLoading}
                {...props}
            >
                <ButtonIcon icon={leftIcon} isLoading={isLoading} />
                <Slottable>{children}</Slottable>
                <ButtonIcon icon={rightIcon} />
            </Component>
        );
    }
);

Button.displayName = 'Button';
