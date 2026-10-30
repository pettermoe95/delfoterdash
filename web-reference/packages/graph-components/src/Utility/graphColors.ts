import type { GraphColorVariation } from '@brilliant/components';
import { pickColorBasedOnTheme } from '@brilliant/components';
import { primitives } from '@bv/design-tokens';
import Color from 'color';

const { colors } = primitives;

export const GraphColorConfig = {
    increase: colors.primary.success[700], // Green for increases
    decrease: colors.primary.error[700], // Red for decreases
    target: colors.primary.warning[700], // Orange for target
    default: colors.primary.grayDark[500],
};

function getThemeTextColors() {
    return {
        decrease: pickColorBasedOnTheme(
            colors.primary.error[700],
            colors.primary.error[500]
        ),
        increase: pickColorBasedOnTheme(
            colors.primary.success[700],
            colors.primary.success[500]
        ),
    };
}

export const customColorOverride = (
    color: string | undefined,
    colors: GraphColorVariation
) => {
    if (color) {
        return {
            fill: color,
            stroke: Color(color).darken(0.2).hex(),
        };
    }
    return {
        fill: colors.fill,
        stroke: colors.stroke,
    };
};

/**
 * Returns the appropriate color based on a percentage change.
 * @param {number | undefined} change The percentage change value.
 * @param {'targetvalue' | 'compare' | '' | undefined} type Graph type flag that toggles target styling.
 * @returns {string} The color string.
 */
export function getChangeColor(
    change?: number,
    type?: 'targetvalue' | 'compare' | ''
): string {
    const { increase, decrease } = getThemeTextColors();
    if (change === undefined) return GraphColorConfig.default;
    if (type === 'targetvalue') {
        return change < 100 ? GraphColorConfig.target : increase;
    }
    return change >= 0 ? increase : decrease;
}
