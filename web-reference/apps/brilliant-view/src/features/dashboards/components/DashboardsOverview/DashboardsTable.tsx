import { Avatar } from '@brilliant/bds-core';
import type { Dashboard } from '@bv/api';
import type { DashboardGradientProps } from '@bv/ui';
import {
    CellContent,
    DashboardIcon,
    DataTable,
    getMaxDashboardUpdatedDate,
    getRelativeHumanDate,
    parseDashboardIconName,
} from '@bv/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useLocaleValue, useLocalize } from '~/i18n/I18nContext';
import { useMemo } from 'react';
import { DashboardActionsDropdown } from './DashboardActionsDropdown';
import { useNavigateToDashboard } from './useNavigateToDashboard';

const columnHelper = createColumnHelper<Dashboard>();

function createColumns(localize: (key: string) => string, locale: string) {
    return [
        columnHelper.accessor('name', {
            header: localize('dashboards.dashboard'),
            cell: (cell) => {
                return (
                    <CellContent hierarchy="primary">
                        <DashboardIcon
                            size="xs_padding_4px"
                            color={
                                cell.row.original
                                    .color as DashboardGradientProps['color']
                            }
                            icon={parseDashboardIconName(
                                cell.row.original.icon
                            )}
                        />
                        {cell.getValue()}
                    </CellContent>
                );
            },
        }),
        columnHelper.accessor(
            (row) => `${row.created_by.first_name} ${row.created_by.last_name}`,
            {
                header: localize('dashboards.owner'),
                id: 'owner',
                cell: (cell) => {
                    const createdBy = cell.getValue();
                    return (
                        <CellContent hierarchy="primary">
                            <Avatar
                                size="xs"
                                src={
                                    cell.row.original.created_by?.picture_url ??
                                    undefined
                                }
                                name={createdBy}
                            />
                            {createdBy}
                        </CellContent>
                    );
                },
            }
        ),
        columnHelper.accessor('private', {
            header: localize('dashboards.access'),
            cell: (cell) => (
                <CellContent hierarchy="primary">
                    {cell.getValue()
                        ? localize('dashboards.accessPrivate')
                        : localize('dashboards.accessPublic')}
                </CellContent>
            ),
        }),
        columnHelper.accessor((row) => getMaxDashboardUpdatedDate(row), {
            header: localize('dashboards.lastUpdated'),
            id: 'lastUpdated',
            cell: (cell) => {
                return (
                    <CellContent>
                        {getRelativeHumanDate(cell.getValue(), locale)}
                    </CellContent>
                );
            },
        }),
        columnHelper.display({
            header: '',
            size: 40,
            id: 'actions',
            cell: (cell) => {
                return (
                    <CellContent>
                        <DashboardActionsDropdown
                            dashboard={cell.row.original}
                        />
                    </CellContent>
                );
            },
        }),
    ];
}

type DashboardsTable = {
    data: Dashboard[];
    isLoading?: boolean;
};

export function DashboardsTable({
    data: dashboards,
    isLoading,
}: DashboardsTable) {
    const navigateToDashboard = useNavigateToDashboard();

    const localize = useLocalize();
    const locale = useLocaleValue();
    const columns = useMemo(
        () => createColumns(localize, locale),
        [localize, locale]
    );

    return (
        <DataTable
            columns={columns}
            data={dashboards}
            isLoading={isLoading}
            rowConfig={{
                onClick: (row) => {
                    navigateToDashboard(row.original);
                },
            }}
            noDataMessage={localize('dashboards.noDataMessage')}
            sortable
            stickyHeader
        />
    );
}
