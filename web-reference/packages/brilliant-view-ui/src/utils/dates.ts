import type { Dashboard } from '@bv/api';
import dayjs from 'dayjs';
import 'dayjs/locale/nb';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function getRelativeHumanDate(date: string | Date, locale?: string) {
    const dateToParse =
        typeof date === 'string' ? addTimezoneToDatestring(date) : date;
    return dayjs(dateToParse)
        .locale(locale ?? 'en')
        .fromNow();
}

export function getRelativeDashboardUpdatedDate(
    dashboard: Dashboard,
    locale: string
) {
    const maxUpdatedDate = getMaxDashboardUpdatedDate(dashboard);

    return getRelativeHumanDate(maxUpdatedDate, locale);
}

export function getMaxDashboardUpdatedDate(dashboard: Dashboard) {
    if (!dashboard.layout_updated_at) {
        return dashboard.updated_at;
    }

    return new Date(dashboard.layout_updated_at) >
        new Date(dashboard.updated_at)
        ? dashboard.layout_updated_at
        : dashboard.updated_at;
}

function addTimezoneToDatestring(date: string) {
    return date.includes('Z') ? date : `${date}Z`;
}

export const formatLocalDateTime = (value: Date) => {
    const date = value;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};
