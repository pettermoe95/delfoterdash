import { colors } from './Colors';

export interface Tokens {
    [key: string]: string | Tokens;
}

const { base, primary, secondary, dashboard } = colors;
/**
 * LIGHT MODE (Default)
 */
export const background = {
    primary: {
        default: base.white,
        alt: base.white,
        hover: primary.gray[50],
        solid: primary.gray[950],
    },
    secondary: {
        default: primary.gray[50],
        alt: primary.gray[25],
        hover: primary.gray[100],
        subtle: primary.gray[25],
        solid: primary.gray[600],
    },
    tertiary: primary.gray[100],
    quaternary: primary.gray[200],
    active: primary.gray[50],
    disabled: {
        default: primary.gray[100],
        subtle: primary.gray[50],
    },
    overlay: primary.gray[950],
    brand: {
        primary: {
            default: primary.brand[50],
            alt: primary.brand[50],
        },
        secondary: {
            default: primary.brand[100],
            alt: secondary.violet[100],
        },
        tertiary: secondary.cherry[100],
        solid: {
            primary: {
                default: primary.brand[600],
                hover: primary.brand[700],
            },
            secondary: {
                default: secondary.violet[600],
                hover: secondary.violet[700],
            },
            tertiary: {
                default: secondary.cherry[600],
                hover: secondary.cherry[700],
            },
        },
        section: {
            primary: {
                default: primary.brand[800],
                subtle: primary.brand[700],
            },
            secondary: {
                default: secondary.violet[800],
                subtle: secondary.violet[700],
            },
            tertiary: {
                default: secondary.cherry[800],
                subtle: secondary.violet[700],
            },
        },
    },
    error: {
        primary: primary.error[50],
        secondary: primary.error[100],
        solid: primary.error[600],
    },
    warning: {
        primary: primary.warning[50],
        secondary: primary.warning[100],
        solid: primary.warning[600],
    },
    success: {
        primary: primary.success[50],
        secondary: primary.success[100],
        solid: primary.success[600],
    },
} satisfies Tokens;

export const dashboardColors = {
    blue: {
        50: dashboard.blue[50],
        100: dashboard.blue[100],
        200: dashboard.blue[200],
        300: dashboard.blue[300],
        400: dashboard.blue[400],
        500: dashboard.blue[500],
        600: dashboard.blue[600],
        700: dashboard.blue[700],
        800: dashboard.blue[800],
    },
    teal: {
        50: dashboard.teal[50],
        100: dashboard.teal[100],
        200: dashboard.teal[200],
        300: dashboard.teal[300],
        400: dashboard.teal[400],
        500: dashboard.teal[500],
        600: dashboard.teal[600],
        700: dashboard.teal[700],
        800: dashboard.teal[800],
    },
    yellow: {
        50: dashboard.yellow[50],
        100: dashboard.yellow[100],
        200: dashboard.yellow[200],
        300: dashboard.yellow[300],
        400: dashboard.yellow[400],
        500: dashboard.yellow[500],
        600: dashboard.yellow[600],
        700: dashboard.yellow[700],
        800: dashboard.yellow[800],
    },
    red: {
        50: dashboard.red[50],
        100: dashboard.red[100],
        200: dashboard.red[200],
        300: dashboard.red[300],
        400: dashboard.red[400],
        500: dashboard.red[500],
        600: dashboard.red[600],
        700: dashboard.red[700],
        800: dashboard.red[800],
    },
    purple: {
        50: dashboard.purple[50],
        100: dashboard.purple[100],
        200: dashboard.purple[200],
        300: dashboard.purple[300],
        400: dashboard.purple[400],
        500: dashboard.purple[500],
        600: dashboard.purple[600],
        700: dashboard.purple[700],
        800: dashboard.purple[800],
    },
    pink: {
        50: dashboard.pink[50],
        100: dashboard.pink[100],
        200: dashboard.pink[200],
        300: dashboard.pink[300],
        400: dashboard.pink[400],
        500: dashboard.pink[500],
        600: dashboard.pink[600],
        700: dashboard.pink[700],
        800: dashboard.pink[800],
    },
    green: {
        50: dashboard.green[50],
        100: dashboard.green[100],
        200: dashboard.green[200],
        300: dashboard.green[300],
        400: dashboard.green[400],
        500: dashboard.green[500],
        600: dashboard.green[600],
        700: dashboard.green[700],
        800: dashboard.green[800],
    },
} satisfies Tokens;

export const text = {
    primary: {
        default: primary.gray[900],
        onBrand: base.white,
    },
    secondary: {
        default: primary.gray[700],
        hover: primary.gray[800],
        onBrand: primary.gray[200],
    },
    tertiary: {
        default: primary.gray[600],
        hover: primary.gray[700],
        onBrand: primary.gray[200],
    },
    quaternary: {
        default: primary.gray[500],
        onBrand: primary.gray[300],
    },
    white: base.white,
    disabled: primary.gray[400],
    placeholder: {
        default: primary.gray[500],
        subtle: primary.gray[300],
    },
    brand: {
        primary: primary.brand[900],
        secondary: {
            default: primary.brand[700],
            alt: secondary.violet[700],
        },
        tertiary: {
            default: primary.brand[600],
            alt: secondary.cherry[600],
        },
    },
    errorPrimary: primary.error[700],
    warningPrimary: primary.warning[700],
    successPrimary: primary.success[700],
} satisfies Tokens;

export const foreground = {
    primary: primary.gray[900],
    secondary: {
        default: primary.gray[700],
        hover: primary.gray[800],
    },
    tertiary: {
        default: primary.gray[600],
        hover: primary.gray[700],
    },
    quaternary: {
        default: primary.gray[500],
        hover: primary.gray[600],
    },
    quinary: {
        default: primary.gray[400],
        hover: primary.gray[500],
    },
    senary: primary.gray[300],
    white: base.white,
    disabled: {
        default: primary.gray[400],
        subtle: primary.gray[300],
    },
    brand: {
        primary: {
            default: primary.brand[600],
            alt: primary.brand[600],
        },
        secondary: {
            default: primary.brand[500],
            alt: secondary.violet[600],
        },
        tertiary: secondary.cherry[600],
    },
    error: {
        primary: primary.error[600],
        secondary: primary.error[500],
    },
    warning: {
        primary: primary.warning[600],
        secondary: primary.warning[500],
    },
    success: {
        primary: primary.success[600],
        secondary: primary.success[500],
    },
} satisfies Tokens;

export const border = {
    primary: primary.gray[300],
    secondary: primary.gray[200],
    tertiary: primary.gray[100],
    disabled: {
        default: primary.gray[300],
        subtle: primary.gray[200],
    },
    brand: {
        primary: {
            default: primary.brand[300],
            solid: {
                default: primary.brand[600],
                alt: primary.brand[600],
                hover: primary.brand[700],
            },
        },
        secondary: {
            default: secondary.violet[300],
            solid: {
                default: secondary.violet[600],
                alt: secondary.violet[600],
            },
        },
        tertiary: {
            default: secondary.cherry[300],
            tertiary: {
                solid: {
                    default: secondary.cherry[600],
                    alt: secondary.cherry[600],
                },
            },
        },
    },
    success: {
        default: primary.success[300],
        solid: primary.success[600],
    },
    error: {
        default: primary.error[300],
        solid: primary.error[600],
    },
    warning: {
        default: primary.warning[300],
        solid: primary.warning[600],
    },
} satisfies Tokens;

export const borderDark = {
    primary: primary.grayDark[700],
    secondary: primary.grayDark[800],
    tertiary: primary.grayDark[800],
    disabled: {
        default: primary.grayDark[700],
        subtle: primary.grayDark[800],
    },
    brand: {
        primary: {
            default: primary.brand[400],
            solid: {
                default: primary.brand[500],
                alt: primary.grayDark[700],
                hover: primary.brand[500],
            },
        },
        secondary: {
            default: secondary.violet[400],
            solid: {
                default: secondary.violet[500],
                alt: primary.grayDark[700],
            },
        },
        tertiary: {
            default: secondary.cherry[400],
            tertiary: {
                solid: {
                    default: secondary.cherry[500],
                    alt: primary.grayDark[700],
                },
            },
        },
    },
    success: {
        default: primary.success[400],
        solid: primary.success[500],
    },
    error: {
        default: primary.error[400],
        solid: primary.error[500],
    },
    warning: {
        default: primary.warning[400],
        solid: primary.warning[500],
    },
} satisfies typeof border;

export const lightMode = {
    bg: background,
    text,
    fg: foreground,
    border,
    db: dashboardColors,
};

/**
 * DARK MODE
 */

export const backgroundDark = {
    primary: {
        default: primary.grayDark[950],
        alt: primary.grayDark[900],
        hover: primary.grayDark[800],
        solid: primary.grayDark[900],
    },
    secondary: {
        default: primary.grayDark[900],
        alt: primary.grayDark[900],
        hover: primary.grayDark[800],
        subtle: primary.grayDark[900],
        solid: primary.grayDark[600],
    },
    tertiary: primary.grayDark[800],
    quaternary: primary.grayDark[700],
    active: primary.grayDark[800],
    disabled: {
        default: primary.grayDark[800],
        subtle: primary.grayDark[900],
    },
    overlay: primary.grayDark[800],
    brand: {
        primary: {
            default: primary.brand[950],
            alt: primary.grayDark[800],
        },
        secondary: {
            default: primary.brand[600],
            alt: secondary.violet[600],
        },
        tertiary: secondary.cherry[950],
        solid: {
            primary: {
                default: primary.brand[600],
                hover: primary.brand[500],
            },
            secondary: {
                default: secondary.violet[600],
                hover: secondary.violet[500],
            },
            tertiary: {
                default: secondary.cherry[600],
                hover: secondary.cherry[500],
            },
        },
        section: {
            primary: {
                default: primary.grayDark[800],
                subtle: primary.grayDark[950],
            },
            secondary: {
                default: primary.grayDark[800],
                subtle: primary.grayDark[950],
            },
            tertiary: {
                default: primary.grayDark[800],
                subtle: primary.grayDark[950],
            },
        },
    },
    error: {
        primary: primary.error[600],
        secondary: primary.error[600],
        solid: primary.error[600],
    },
    warning: {
        primary: primary.warning[600],
        secondary: primary.warning[600],
        solid: primary.warning[600],
    },
    success: {
        primary: primary.success[600],
        secondary: primary.success[600],
        solid: primary.success[600],
    },
};

export const textDark = {
    primary: {
        default: primary.grayDark[50],
        onBrand: primary.grayDark[50],
    },
    secondary: {
        default: primary.grayDark[300],
        hover: primary.grayDark[200],
        onBrand: primary.grayDark[400],
    },
    tertiary: {
        default: primary.grayDark[400],
        hover: primary.grayDark[300],
        onBrand: primary.grayDark[400],
    },
    quaternary: {
        default: primary.grayDark[400],
        onBrand: primary.grayDark[400],
    },
    white: base.white,
    disabled: primary.grayDark[500],
    placeholder: {
        default: primary.grayDark[400],
        subtle: primary.grayDark[700],
    },
    brand: {
        primary: primary.grayDark[50],
        secondary: {
            default: primary.brand[100],
            alt: secondary.violet[100],
        },
        tertiary: {
            default: primary.grayDark[400],
            alt: primary.grayDark[400],
        },
    },
    errorPrimary: primary.error[100],
    warningPrimary: primary.warning[100],
    successPrimary: primary.success[100],
};

export const dashboardColorsDark = {
    blue: {
        50: dashboard.blue[950],
        100: dashboard.blue[900],
        200: dashboard.blue[800],
        300: dashboard.blue[700],
        400: dashboard.blue[600],
        500: dashboard.blue[500],
        600: dashboard.blue[400],
        700: dashboard.blue[300],
        800: dashboard.blue[200],
    },
    teal: {
        50: dashboard.teal[950],
        100: dashboard.teal[900],
        200: dashboard.teal[800],
        300: dashboard.teal[700],
        400: dashboard.teal[600],
        500: dashboard.teal[500],
        600: dashboard.teal[400],
        700: dashboard.teal[300],
        800: dashboard.teal[200],
    },
    yellow: {
        50: dashboard.yellow[950],
        100: dashboard.yellow[900],
        200: dashboard.yellow[800],
        300: dashboard.yellow[700],
        400: dashboard.yellow[600],
        500: dashboard.yellow[500],
        600: dashboard.yellow[400],
        700: dashboard.yellow[300],
        800: dashboard.yellow[200],
    },
    red: {
        50: dashboard.red[950],
        100: dashboard.red[900],
        200: dashboard.red[800],
        300: dashboard.red[700],
        400: dashboard.red[600],
        500: dashboard.red[500],
        600: dashboard.red[400],
        700: dashboard.red[300],
        800: dashboard.red[200],
    },
    purple: {
        50: dashboard.purple[950],
        100: dashboard.purple[900],
        200: dashboard.purple[800],
        300: dashboard.purple[700],
        400: dashboard.purple[600],
        500: dashboard.purple[500],
        600: dashboard.purple[400],
        700: dashboard.purple[300],
        800: dashboard.purple[200],
    },
    pink: {
        50: dashboard.pink[950],
        100: dashboard.pink[900],
        200: dashboard.pink[800],
        300: dashboard.pink[700],
        400: dashboard.pink[600],
        500: dashboard.pink[500],
        600: dashboard.pink[400],
        700: dashboard.pink[300],
        800: dashboard.pink[200],
    },
    green: {
        50: dashboard.green[950],
        100: dashboard.green[900],
        200: dashboard.green[800],
        300: dashboard.green[700],
        400: dashboard.green[600],
        500: dashboard.green[500],
        600: dashboard.green[400],
        700: dashboard.green[300],
        800: dashboard.green[200],
    },
} satisfies typeof dashboardColors;

export const foregroundDark = {
    primary: base.white,
    secondary: {
        default: primary.grayDark[300],
        hover: primary.grayDark[200],
    },
    tertiary: {
        default: primary.grayDark[400],
        hover: primary.grayDark[300],
    },
    quaternary: {
        default: primary.grayDark[400],
        hover: primary.grayDark[300],
    },
    quinary: {
        default: primary.grayDark[500],
        hover: primary.grayDark[400],
    },
    senary: primary.grayDark[600],
    white: base.white,
    disabled: {
        default: primary.grayDark[500],
        subtle: primary.grayDark[600],
    },
    brand: {
        primary: {
            default: primary.brand[600],
            alt: primary.grayDark[300],
        },
        secondary: {
            default: primary.brand[500],
            alt: secondary.violet[500],
        },
        tertiary: secondary.cherry[500],
    },
    error: {
        primary: primary.error[600],
        secondary: primary.error[500],
    },
    warning: {
        primary: primary.warning[600],
        secondary: primary.warning[500],
    },
    success: {
        primary: primary.success[600],
        secondary: primary.success[500],
    },
} satisfies typeof foreground;

export const darkMode = {
    bg: backgroundDark,
    text: textDark,
    fg: foregroundDark,
    border: borderDark,
    db: dashboardColorsDark,
} satisfies typeof lightMode;
