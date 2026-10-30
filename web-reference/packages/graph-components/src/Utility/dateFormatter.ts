// Date formatting helpers shared across graph components
// Provides a stable month-year formatter (e.g., "January 2025")

const monthYearFormatter = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
});

/**
 * Format a Date as localized Month + Year (e.g., "January 2025").
 */
export const formatMonthYear = (d: Date): string =>
    monthYearFormatter.format(d);

export type DateLabelFormatter = (d: Date) => string;
