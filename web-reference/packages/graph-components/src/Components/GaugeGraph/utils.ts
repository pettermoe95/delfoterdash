import type { GraphLayout } from '../../Common/layout';

const MOBILE_HORIZONTAL_PADDING = 0;
const MIN_HORIZONTAL_PADDING = 24;
const MAX_HORIZONTAL_PADDING = 85;
const HORIZONTAL_PADDING_RATIO = 0.13;
const VERTICAL_PADDING = 25;

export function getGaugeLayout(
    baseLayout: GraphLayout,
    isMobile: boolean
): GraphLayout {
    const horizontalPadding = isMobile
        ? MOBILE_HORIZONTAL_PADDING
        : Math.min(
              MAX_HORIZONTAL_PADDING,
              Math.max(
                  MIN_HORIZONTAL_PADDING,
                  baseLayout.outerWidth * HORIZONTAL_PADDING_RATIO
              )
          );

    return {
        ...baseLayout,
        width: Math.max(baseLayout.width - horizontalPadding * 2, 0),
        height: Math.max(baseLayout.height - VERTICAL_PADDING * 2, 0),
        left: horizontalPadding,
        right: baseLayout.right - horizontalPadding,
        top: VERTICAL_PADDING,
        bottom: baseLayout.bottom - VERTICAL_PADDING,
    };
}

/**
 * Splits longer comparison labels into multiple lines while preserving any
 * explicit line breaks already present in localized copy.
 */
export function wrapComparisonLabel(
    text: string,
    maxCharactersPerLine: number
): string[] {
    return text.split('\n').flatMap((rawLine) => {
        const line = rawLine.trim();
        if (!line) return [''];

        const words = line.split(/\s+/);
        const wrappedLines = [];
        let currentLine = '';

        words.forEach((word) => {
            const nextLine = currentLine ? `${currentLine} ${word}` : word;

            if (nextLine.length <= maxCharactersPerLine) {
                currentLine = nextLine;
                return;
            }

            if (currentLine) {
                wrappedLines.push(currentLine);
            }

            currentLine = word;
        });

        if (currentLine) {
            wrappedLines.push(currentLine);
        }

        return wrappedLines;
    });
}
