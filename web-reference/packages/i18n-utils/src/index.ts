/*
    This file contains all functions and types needed to make internationalization work outside of the application
    Actual localization functions from i18nprovider will still need to be passed from the app
*/
type Vars = Record<string, string | number>;
export type LocalizeFn = (key: string, vars?: Vars) => string;

const monthLabelNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

export function localizeUnit(unit: string, localize?: LocalizeFn): string {
    /*
        This function handles specific cases for translation where applicable
        Feel free to extend this function with any other normal cases we could handle
        Remember to include keys/values in both locale files if you do!
    */

    //Check for month units
    if (monthLabelNames.findIndex((x) => x == unit.toLowerCase()) > -1) {
        const key = 'time.monthNames.' + unit.toLowerCase();
        const localized = localize?.(key) ?? unit;
        if (key === localized) {
            //No hits in locale file, shouldn't be possible since we check on monthLabelNames, but hey..
            return unit;
        }

        return localized;
    }

    //Normal time cases
    switch (unit.toLowerCase()) {
        case 'hour':
            return localize?.('time.hour') ?? unit;
        case 'hours':
            return localize?.('time.hours') ?? unit;
        case 'day':
            return localize?.('time.day') ?? unit;
        case 'days':
            return localize?.('time.days') ?? unit;
        case 'week':
            return localize?.('time.week') ?? unit;
        case 'weeks':
            return localize?.('time.weeks') ?? unit;
        case 'month':
            return localize?.('time.month') ?? unit;
        case 'months':
            return localize?.('time.months') ?? unit;
        case 'quarter':
            return localize?.('time.quarter') ?? unit;
        case 'year':
            return localize?.('time.year') ?? unit;
        default:
            return unit;
    }
}
