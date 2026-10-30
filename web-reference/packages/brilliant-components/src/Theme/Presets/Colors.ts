import type { ThemeColors } from '../ThemeDefinition';

// ===================================== //
//              Theme Colors             //
// ===================================== //

const actionDefault = {
    // Primary/main action colors
    action_primary: {
        base: '#d3ecf0',
        hover: '#c1e1e6',
        active: '#c1e1e6',
        disabled: '#c5d3df',
    },
    action_text_primary: {
        base: '#154059',
        hover: '#154059',
        active: '#154059',
        disabled: '#aaa',
    },
    // Secondary action colors
    action_secondary: {
        base: '#ddd',
        hover: '#ccc',
        active: '#bbb',
        disabled: '#efefef',
    },
    action_text_secondary: {
        base: '#000',
        hover: '#000',
        active: '#000',
        disabled: '#aaa',
    },
    // Positive action colors
    action_positive: {
        base: '#d4f0d3',
        hover: '#82ea50',
        active: '#53c81a',
        disabled: '#c4e6b3',
    },
    action_text_positive: {
        base: '#347331',
        hover: '#347331',
        active: '#347331',
        disabled: '#aaa',
    },
    // Negative action colors
    action_negative: {
        base: '#ebc0c0',
        hover: '#fb5858',
        active: '#d61111',
        disabled: '#f7d2d2',
    },
    action_text_negative: {
        base: '#d61111',
        hover: '#d61111',
        active: '#d61111',
        disabled: '#aaa',
    },
};

const graphDefault = {
    graph_neutral: {
        stroke: '#e4d6ca',
        fill: '#fff4eb',
        text_lightmode: '#B55008',
        text_darkmode: '#F79C09',
    },
    graph_negative: {
        stroke: '#ae653d',
        fill: '#D58960',
        text_lightmode: '#B3261E',
        text_darkmode: '#ED4940',
    },
    graph_positive: {
        stroke: '#7aa057',
        fill: '#B8E490',
        text_lightmode: '#06763C',
        text_darkmode: '#17B25A',
    },
    graph_default: {
        stroke: '#0bacb8',
        fill: '#0bccda',
        text_lightmode: '#0bacb8',
        text_darkmode: '#0bccda',
    },
};

const defaultLight: ThemeColors = {
    ...actionDefault,
    ...graphDefault,
    base_background: '#eee',
    background: {
        primary: '#fff',
        secondary: '#f7f7f7',
        tertiary: '#efefef',
    },
    border: {
        primary: 'transparent',
        secondary: 'transparent',
        tertiary: 'transparent',
    },
    text: {
        primary: '#111',
        secondary: '#888',
        tertiary: '#aaa',
    },
    accent: {
        primary: '#618CD5',
        secondary: '#618CD5',
        tertiary: '#618CD5',
    },
    accent_text: {
        primary: '#fff',
        secondary: '#fff',
        tertiary: '#fff',
    },
};

const defaultDark: ThemeColors = {
    ...actionDefault,
    ...graphDefault,
    base_background: '#080808',
    background: {
        primary: '#1E1F21',
        secondary: '#74716C',
        tertiary: '#74716C',
    },
    border: {
        primary: '#444',
        secondary: '#444',
        tertiary: '#444',
    },
    text: {
        primary: '#eee',
        secondary: '#aaa',
        tertiary: '#999',
    },
    accent: defaultLight.accent,
    accent_text: defaultLight.accent_text,
    // Action
    action_primary: {
        base: '#52c3c7',
        hover: '#59cbcf',
        active: '#49b6ba',
        disabled: '#6aa9ab',
    },
    action_text_primary: {
        base: '#fff',
        hover: '#fff',
        active: '#fff',
        disabled: '#ccc',
    },
    action_secondary: {
        base: '#555',
        hover: '#666',
        active: '#444',
        disabled: '#222',
    },
    action_text_secondary: {
        base: '#fff',
        hover: '#fff',
        active: '#fff',
        disabled: '#aaa',
    },
    action_positive: {
        base: '#285c2c',
        hover: '#306b35',
        active: '#26592a',
        disabled: '#778f79',
    },
    action_text_positive: {
        base: '#4bc953',
        hover: '#4bc953',
        active: '#4bc953',
        disabled: '#aaa',
    },
    action_negative: {
        base: '#661111',
        hover: '#731818',
        active: '#5e1515',
        disabled: '#f7d2d2',
    },
    action_text_negative: {
        base: '#eb4b4b',
        hover: '#eb4b4b',
        active: '#eb4b4b',
        disabled: '#aaa',
    },
};

const brilliantGreen: ThemeColors = {
    ...actionDefault,
    ...graphDefault,
    base_background: '#229c45',
    background: {
        primary: '#42c366',
        secondary: '#3fb05f',
        tertiary: '#319f50',
    },
    border: {
        primary: '#484',
        secondary: '#484',
        tertiary: '#484',
    },
    text: {
        primary: '#eee',
        secondary: '#fff',
        tertiary: '#474',
    },
    accent: {
        primary: '#F7C04A',
        secondary: '#e0ab38',
        tertiary: '#c79324',
    },
    accent_text: {
        primary: '#fff',
        secondary: '#fff',
        tertiary: '#fff',
    },
    // Testing
    action_primary: {
        ...defaultLight.action_primary,
        base: '#ce0808',
    },
    action_negative: {
        ...defaultLight.action_negative,
        base: '#ce0808',
    },
};

export const THEME_COLORS: Record<string, ThemeColors> = {
    light: defaultLight,
    dark: defaultDark,
    green: brilliantGreen,
};
