const borderRadius = {
    none: '0px',
    xxs: '2px',
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '20px',
    '4xl': '24px',
    full: '9999px',
};

const spacing = {
    none: '0px',
    xxs: '2px',
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '40px',
    '6xl': '48px',
    '7xl': '64px',
    '8xl': '80px',
    '9xl': '96px',
    '10xl': '128px',
    '11xl': '160px',
};

function unitsToSize(value: number) {
    return value * 4 + 'px';
}

export const looks = {
    borderRadius: borderRadius,
    spacing: spacing,
    width: spacing,
    height: spacing,
    paragraphMaxWidth: unitsToSize(180),
};
