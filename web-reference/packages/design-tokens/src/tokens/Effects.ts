import { colors } from './Colors';

const { primary, secondary } = colors;

const boxShadow = {
    xs: '0px 1px 2px rgba(18, 25, 38, 0.05)',
    sm: '0px 1px 3px rgba(18, 25, 38, 0.10)',
    md: '0px 4px 8px -2px rgba(18, 25, 38, 0.10)',
    lg: '0px 12px 16px -4px rgba(18, 25, 38, 0.08)',
    xl: '0px 20px 24px -4px rgba(18, 25, 38, 0.08)',
    '2xl': '0px 24px 48px -12px rgba(18, 25, 38, 0.18)',
    '3xl': '0px 32px 64px -12px rgba(18, 25, 38, 0.14)',
};

const ring = {
    brand: {
        default: variableToFocusRing(primary.brand[500]),
    },
    secondary: variableToFocusRing(secondary.violet[500]),
    gray: {
        default: variableToFocusRing(primary.gray[400], 0.14),
        secondary: variableToFocusRing(primary.gray[400], 0.2),
    },
    error: variableToFocusRing(primary.error[500]),
};

function variableToFocusRing(variable: string, opacity = 0.24) {
    const hexOpacity = getHexOpacity(opacity);
    return `0px 0px 0px 2px ${variable}${hexOpacity}`;
}

function getHexOpacity(opacity: number) {
    // Hex opacity is calculated with percentage of 255, rounded down.
    return Math.floor(opacity * 255).toString(16);
}

export const effects = {
    shadow: boxShadow,
    ring,
};
