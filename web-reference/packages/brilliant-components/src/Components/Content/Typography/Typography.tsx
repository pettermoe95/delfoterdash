import type { PropsWithChildren } from 'react';

export const displayTypography = {
    '2-xl': ['medium'],
    xl: ['medium'],
    lg: ['medium'],
    md: ['medium', 'regular'],
    sm: ['medium', 'regular'],
    xs: ['regular', 'medium', 'semi-bold'],
} as const;
type DisplaySize = keyof typeof displayTypography;
type DisplayWeight = (typeof displayTypography)[DisplaySize][number];

export const textTypography = {
    xl: ['light', 'regular', 'medium'],
    lg: ['light', 'regular', 'medium'],
    md: ['light', 'regular', 'medium', 'semi-bold'],
    sm: ['light', 'regular', 'medium', 'semi-bold'],
    xs: ['regular', 'medium', 'semi-bold'],
} as const;
type TextSize = keyof typeof textTypography;
type TextWeight = (typeof textTypography)[TextSize][number];

type TypographyProps = PropsWithChildren &
    (
        | {
              type: 'display';
              size: DisplaySize;
              weight: DisplayWeight;
          }
        | {
              type: 'text';
              size: TextSize;
              weight: TextWeight;
          }
    );
export function Typography({ type, size, weight, children }: TypographyProps) {
    const getFontVariable = () => {
        return `var(--${type}-font-${size}-${weight})`;
    };
    return <span style={{ font: getFontVariable() }}>{children}</span>;
}
