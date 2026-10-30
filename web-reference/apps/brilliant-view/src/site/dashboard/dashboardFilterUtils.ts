import type { Maybe, SelectOption } from '@brilliant/bds-core';
import type { Dashboard } from '@bv/api';
import { toText } from '~/utils/text';

export const OWNED_BY_STORAGE_KEY = 'ownedByFilter';
export const DEFAULT_OWNED_BY = '-1';

type FilterDashboardsInput = {
    dashboards: Dashboard[] | undefined;
    selectedOwnerId: string | null;
    searchQuery: string;
};

export const getDashboardOptions = (
    dashboards: Dashboard[] | undefined,
    ownedByEveryoneLabel: string
): SelectOption[] => {
    if (dashboards === undefined) {
        return [];
    }
    const owners: SelectOption[] = [
        { label: ownedByEveryoneLabel, value: DEFAULT_OWNED_BY },
    ];
    dashboards?.forEach((dashboard) => {
        const ownerName = `${dashboard.created_by.first_name} ${dashboard.created_by.last_name}`;
        const ownerIds = owners.map((owner) => owner.value);
        if (!ownerIds.includes(dashboard.created_by.id.toString())) {
            owners.push({
                label: ownerName,
                value: dashboard.created_by.id.toString(),
            });
        }
    });

    // Order elements by names' alphabetical order
    owners.sort((a, b) => {
        const labelA = toText(a.label);
        const labelB = toText(b.label);
        return labelA.localeCompare(labelB);
    });

    return owners;
};

const filterDashboardsByOwner = (
    dashboards: Dashboard[],
    selectedOwnerId: Maybe<string>
): Dashboard[] => {
    if (!selectedOwnerId || selectedOwnerId === DEFAULT_OWNED_BY) {
        return dashboards;
    }
    dashboards = dashboards.filter((dashboard) => {
        return dashboard.created_by.id === parseInt(selectedOwnerId);
    });

    return dashboards;
};

export const filterDashboards = (input: FilterDashboardsInput): Dashboard[] => {
    const { dashboards, selectedOwnerId, searchQuery } = input;
    if (dashboards === undefined) {
        return [];
    }
    let filteredDashboards: Dashboard[] = dashboards;
    filteredDashboards = filteredDashboards?.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filteredDashboards = filterDashboardsByOwner(
        filteredDashboards,
        selectedOwnerId
    );
    // TODO filter by data source
    // TODO filter by team
    return filteredDashboards;
};

export function getStoredOwnedByFilter(): string {
    if (typeof window === 'undefined') {
        return DEFAULT_OWNED_BY;
    }

    return (
        window.sessionStorage.getItem(OWNED_BY_STORAGE_KEY) ?? DEFAULT_OWNED_BY
    );
}

export function clearStoredOwnedByFilter() {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.removeItem(OWNED_BY_STORAGE_KEY);
}
