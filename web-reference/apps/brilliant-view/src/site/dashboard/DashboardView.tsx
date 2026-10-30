import type { SelectOption } from '@brilliant/bds-core';
import { cn } from '@brilliant/bds-core';
import { useIsMobile } from '@brilliant/components';
import type { Concept, DashboardDetails } from '@bv/api';
import { DASHBOARD_WIDTH } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { API } from '~/api';
import {
    DashboardGrid,
    DashboardHeader,
    DashboardProvider,
    EditPanel,
    GraphBuilderDialog,
    MobileDashboardGrid,
    useDashboardParams,
} from '~/features/dashboards';
import { DashboardFilterMenu } from '~/features/dashboards/components/Filters/DashboardFilters';
import { byGlobalDefaultThenByPrettyName } from '~/utils/conceptSorting.ts';
import { useMemo, useState } from 'react';

type DashboardContentProps = {
    dashboard: DashboardDetails;
};

export function DashboardView({ dashboard }: DashboardContentProps) {
    const { editMode } = useDashboardParams();
    const [isGraphBuilderOpen, setIsGraphBuilderOpen] =
        useState<boolean>(false);
    const isMobile = useIsMobile();

    const dashboardHeight = dashboard.layouts.reduce((prev, layout) => {
        return Math.max(prev, layout.y + layout.height);
    }, 2);

    const { data: allConceptFields } = useQuery({
        queryKey: ['list-global-filters'],
        queryFn: API.listGlobalFilters,
    });

    const conceptFieldOptions = useMemo(() => {
        const conceptFields = allConceptFields?.filter(
            (conceptField) => !conceptField.hidden
        );

        return conceptFields
            ?.sort(byGlobalDefaultThenByPrettyName)
            .filter(
                (conceptField: Concept) => conceptField.concept_name != 'date'
            )
            .map((conceptField: Concept): SelectOption => {
                return {
                    value: conceptField.concept_name,
                    label: conceptField.concept_name_pretty,
                };
            });
    }, [allConceptFields]);

    return (
        <DashboardProvider dashboard={dashboard}>
            <div
                data-component-name="dashboard-view"
                className={cn(
                    'mb-16 flex w-full flex-1 overflow-x-hidden lg:mb-0'
                )}
            >
                <div
                    className={cn(
                        'flex w-full flex-1 flex-col py-4xl pt-3xl lg:gap-3xl',
                        editMode ? 'mr-[var(--edit-panel-width)]' : 'mr-0'
                    )}
                >
                    <div className="hidden lg:flex lg:items-center lg:gap-md">
                        <EditPanel />
                    </div>
                    <DashboardHeader />

                    {isMobile ? (
                        <>
                            <div className="mb-0 mt-12 px-2xl">
                                <DashboardFilterMenu
                                    conceptFieldOptions={conceptFieldOptions}
                                    allowAddFilter={editMode}
                                />
                            </div>
                            <MobileDashboardGrid layout={dashboard.layouts} />
                        </>
                    ) : (
                        <>
                            <div className="px-4xl">
                                <DashboardFilterMenu
                                    conceptFieldOptions={conceptFieldOptions}
                                    allowAddFilter={editMode}
                                />
                            </div>
                            <DashboardGrid
                                columns={DASHBOARD_WIDTH}
                                rows={dashboardHeight + 1}
                                layout={dashboard.layouts}
                            />
                        </>
                    )}
                </div>
                <GraphBuilderDialog
                    isOpen={isGraphBuilderOpen}
                    setOpenGraphBuilder={setIsGraphBuilderOpen}
                />
            </div>
        </DashboardProvider>
    );
}
