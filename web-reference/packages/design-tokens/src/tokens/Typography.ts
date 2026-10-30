const display = {
    size: {
        // Font-weight: 500;
        '2xl': '72px',
        xl: '60px',
        lg: '48px',
        // Font-weight: 400;
        md: '36px',
        sm: '30px',
        xs: '24px',
    },
    font: {
        '2xl': {
            medium: '500 72px/90px Rubik',
        },
        xl: {
            // display-font-xl-medium
            medium: '500 60px/72px Rubik',
        },
        lg: {
            medium: '500 48px/60px Rubik',
        },
        md: {
            medium: '500 36px/44px Rubik',
            regular: '400 36px/44px Rubik',
        },
        sm: {
            medium: '500 30px/38px Rubik',
            regular: '400 30px/38px Rubik',
        },
        xs: {
            medium: '500 24px/32px Rubik',
            regular: '400 24px/32px Rubik',
            semiBold: '600 24px/32px Rubik',
        },
    },
};
const text = {
    size: {
        // Font-weight: 400;
        xs: '12px',
        // Font-weight: 300;
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '20px',
    },
    font: {
        xl: {
            light: '300 20px/3px Rubik',
            regular: '400 20px/30px Rubik',
            medium: '500 20px/30px Rubik',
        },
        lg: {
            light: '300 18px/28px Rubik',
            regular: '400 18px/28px Rubik',
            medium: '500 18px/28px Rubik',
        },
        md: {
            light: '300 16px/24px Rubik',
            regular: '400 16px/24px Rubik',
            medium: '500 16px/24px Rubik',
            semiBold: '600 16px/24px Rubik',
        },
        sm: {
            light: '300 14px/20px Rubik',
            regular: '400 14px/20px Rubik',
            medium: '500 14px/20px Rubik',
            semiBold: '600 14px/20px Rubik',
        },
        xs: {
            regular: '400 12px/18px Rubik',
            medium: '500 12px/18px Rubik',
            semiBold: '600 12px/18px Rubik',
        },
    },
};
const graph = {
    size: {
        // Font-weight: 500;
        heading: '20px',
        // Font-weight: 400;
        subtitle: '14px',
    },
    font: {
        heading: {
            medium: '500 20px/30 Rubik',
        },
        subtitle: {
            regular: '400 14px/20 Rubik',
        },
        legend: {
            regular: "400 12px/16 'Roboto Mono'",
            medium: "500 12px/16 'Roboto Mono'",
        },
    },
};
export const typography = {
    text,
    display,
    graph,
};
