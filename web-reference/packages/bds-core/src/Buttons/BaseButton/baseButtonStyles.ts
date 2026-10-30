import { cva } from 'class-variance-authority';
import styles from './BaseButton.module.scss';

export const variantStyles = {
    filled: styles['BaseButton--filled'],
    outlined: styles['BaseButton--outlined'],
    ghost: styles['BaseButton--ghost'],
};
type VariantStyle = keyof typeof variantStyles;

export const colorStyles = {
    primary: '',
    secondary: '',
    gray: '',
    error: '',
};
type ColorStyle = keyof typeof colorStyles;

export const baseButtonStyles = cva(styles.BaseButton, {
    variants: {
        variant: variantStyles,
        color: colorStyles,
        disabled: {
            true: 'bg-disabled text-disabled hover:bg-disabled',
        },
    },
    compoundVariants: [
        ...generateCompoundVariants(
            ['filled', 'primary'],
            ['filled', 'secondary'],
            ['filled', 'error'],
            ['outlined', 'primary'],
            ['outlined', 'secondary'],
            ['outlined', 'gray'],
            ['outlined', 'error'],
            ['ghost', 'primary'],
            ['ghost', 'secondary'],
            ['ghost', 'gray'],
            ['ghost', 'error']
        ),
        {
            variant: 'filled',
            disabled: true,
            className: styles['BaseButton--filled-disabled'],
        },
        {
            variant: 'outlined',
            disabled: true,
            className: styles['BaseButton--outlined-disabled'],
        },
        {
            variant: 'ghost',
            disabled: true,
            className: styles['BaseButton--ghost-disabled'],
        },
    ],
    defaultVariants: {
        variant: 'filled',
        color: 'primary',
    },
});

type CompoundItem = [VariantStyle, ColorStyle];
function generateCompoundVariants(...variants: CompoundItem[]) {
    return variants.map(([variant, color]) => ({
        variant,
        color,
        className: styles[`BaseButton--${variant}-${color}`],
    }));
}
