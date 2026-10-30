import { CellContent, DataTable } from '@bv/ui';
import { createColumnHelper } from '@tanstack/react-table';
import type { WorkflowListItem } from '~/features/workflows/api/types';
import { useListWorkflows } from '~/features/workflows/hooks/useListWorkflows';
import { useLocalize } from '~/i18n/I18nContext';
import { useMemo } from 'react';
import {
    formatDate,
    formatDuration,
    formatIntervalAnchor,
    formatSchedule,
    getScheduleSortValue,
} from '../../../utils/workflowUtils';
import { WorkflowEnableCell } from './WorkflowsEnableCell';

export function WorkflowsTable({ search = '' }: { search?: string }) {
    const localize = useLocalize();
    const { data: workflows, isLoading } = useListWorkflows();
    const normalizedSearch = search.trim().toLowerCase();

    const filteredWorkflows = useMemo(() => {
        if (!workflows) {
            return [];
        }
        if (!normalizedSearch) {
            return workflows;
        }

        return workflows.filter((workflow) =>
            workflow.name.toLowerCase().includes(normalizedSearch)
        );
    }, [normalizedSearch, workflows]);

    const columnHelper = createColumnHelper<WorkflowListItem>();
    const columns = [
        columnHelper.accessor('name', {
            id: 'name',
            header: localize('workflows.workflowTable.name'),
            cell: (cell) => <CellContent>{cell.getValue()}</CellContent>,
        }),
        columnHelper.accessor('schedule', {
            id: 'schedule',
            header: localize('workflows.workflowTable.schedule'),
            sortingFn: (rowA, rowB) => {
                const a = getScheduleSortValue(rowA.original.schedule);
                const b = getScheduleSortValue(rowB.original.schedule);
                return a.localeCompare(b);
            },
            cell: (cell) => (
                <CellContent>
                    {formatSchedule(cell.getValue(), localize)}
                </CellContent>
            ),
        }),
        columnHelper.accessor('intervalAnchor', {
            id: 'intervalAnchor',
            header: localize('workflows.workflowTable.anchor'),
            cell: (cell) => (
                <CellContent>
                    {formatIntervalAnchor(cell.getValue(), localize)}
                </CellContent>
            ),
        }),
        columnHelper.accessor('lastSuccessfulRunAt', {
            id: 'lastSuccessfulRunAt',
            header: localize('workflows.workflowTable.lastSuccessfulRun'),
            cell: (cell) => (
                <CellContent>{formatDate(cell.getValue())}</CellContent>
            ),
        }),
        columnHelper.accessor('lastSuccessfulRunDurationMs', {
            id: 'lastSuccessfulRunDurationMs',
            header: localize('workflows.workflowTable.duration'),
            cell: (cell) => (
                <CellContent>{formatDuration(cell.getValue())}</CellContent>
            ),
        }),
        columnHelper.accessor('failedRunsSinceLastSuccess', {
            id: 'failedRunsSinceLastSuccess',
            header: localize(
                'workflows.workflowTable.failedRunsSinceLastSuccess'
            ),
            cell: (cell) => <CellContent>{cell.getValue()}</CellContent>,
        }),
        columnHelper.accessor('enabled', {
            id: 'enabled',
            header: localize('workflows.workflowTable.enabled'),
            cell: WorkflowEnableCell,
        }),
    ];

    return (
        <div className="min-h-11xl flex-1 overflow-x-auto [&_table]:min-w-[920px]">
            <DataTable
                data={filteredWorkflows}
                columns={columns}
                isLoading={isLoading}
                sortable
                defaultSorting={{ id: 'enabled', desc: true }}
                noDataMessage={localize('workflows.noWorkflowsFound')}
                localizeFn={localize}
            />
        </div>
    );
}
