import { Tooltip } from '@brilliant/bds-core';
import { CellContent, DataTable } from '@bv/ui';
import { createColumnHelper } from '@tanstack/react-table';
import type { CredentialListItem } from '~/features/workflows/api/types';
import { useCredentialsQuery } from '~/features/workflows/hooks/useCredentialsQuery';
import { useLocalize } from '~/i18n/I18nContext';
import { useMemo } from 'react';
import { AuthorizedCredentialCell } from './AuthorizedCredentialCell';
import { EditCredentialsCell } from './EditCredentialsCell';

export function CredentialsTable({ search = '' }: { search?: string }) {
    const localize = useLocalize();
    const { data: credentials, isLoading } = useCredentialsQuery();
    const normalizedSearch = search.trim().toLowerCase();

    const filteredCredentials = useMemo(() => {
        if (!credentials) {
            return [];
        }
        if (!normalizedSearch) {
            return credentials;
        }

        return credentials.filter(
            (credential) =>
                credential.name.toLowerCase().includes(normalizedSearch) ||
                credential.flow_name.toLowerCase().includes(normalizedSearch)
        );
    }, [credentials, normalizedSearch]);

    const columnHelper = createColumnHelper<CredentialListItem>();
    const columns = [
        columnHelper.accessor('name', {
            header: localize('workflows.credentialsTable.name'),
            cell: (cell) => <CellContent>{cell.getValue()}</CellContent>,
        }),
        columnHelper.accessor('flow_name', {
            header: localize('workflows.credentialsTable.credentialType'),
            cell: (cell) => <CellContent>{cell.getValue()}</CellContent>,
        }),
        columnHelper.display({
            id: 'reauthorized',
            header: () => (
                <Tooltip
                    side="top"
                    align="start"
                    triggerAsChild={true}
                    title={localize(
                        'workflows.credentialsTable.reauthorizedInfo'
                    )}
                >
                    <div className="flex items-center gap-1 hover:cursor-help">
                        <span>
                            {localize('workflows.credentialsTable.authorized')}
                        </span>
                    </div>
                </Tooltip>
            ),
            cell: AuthorizedCredentialCell,
        }),
        columnHelper.display({
            id: 'actions',
            maxSize: 80,
            cell: EditCredentialsCell,
        }),
    ];

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-xl">
            <div className="min-h-11xl flex-1 overflow-hidden">
                <DataTable
                    data={filteredCredentials}
                    columns={columns}
                    isLoading={isLoading}
                    sortable
                    defaultSorting={{ id: 'name', desc: false }}
                    noDataMessage={localize('table.noDataMessage')}
                    localizeFn={localize}
                />
            </div>
        </div>
    );
}
