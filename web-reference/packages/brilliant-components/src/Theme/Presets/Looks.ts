import type { ThemeLook } from '../ThemeDefinition';

// ===================================== //
//              Theme Looks              //
// ===================================== //

export const modernRounded: ThemeLook = {
    border_radius: {
        small: '0.5em',
        medium: '0.75em',
        large: '1.25em',
    },
    border_width: {
        small: '1px',
        medium: '2px',
        large: '2px',
    },
    box_shadow: {
        small: '0 0 10px 3px rgba(0, 0, 0, 0.02)',
        medium: '0 0 15px 5px rgba(0, 0, 0, 0.05)',
        large: '1px 2px 40px 3px rgba(0, 0, 0, 0.1)',
    },
};

export const modernSquared: ThemeLook = {
    border_radius: {
        small: '0.1em',
        medium: '0.2em',
        large: '0.3em',
    },
    border_width: {
        small: '1px',
        medium: '2px',
        large: '2px',
    },
    box_shadow: {
        small: '0 0 10px 3px rgba(0, 0, 0, 0.02)',
        medium: '0 0 15px 5px rgba(0, 0, 0, 0.05)',
        large: '0 0 20px 10px rgba(0, 0, 0, 0.05)',
    },
};
