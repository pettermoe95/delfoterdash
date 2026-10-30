import { isAxiosError } from 'axios';

export function getDashboardLoadErrorMessage(
    error: unknown,
    localize: (key: string) => string
) {
    if (isAxiosError(error)) {
        switch (error.response?.status) {
            case 403:
                return localize('dashboards.loadError.forbidden');
            case 404:
                return localize('dashboards.loadError.notFound');
            default:
                return localize('dashboards.loadError.generic');
        }
    }

    return localize('dashboards.loadError.generic');
}

export function getDashboardOverviewLoadErrorMessage(
    error: unknown,
    localize: (key: string) => string
) {
    if (isAxiosError(error) && error.response?.status === 403) {
        return localize('dashboards.loadError.overviewForbidden');
    }

    return localize('dashboards.loadError.overviewGeneric');
}
