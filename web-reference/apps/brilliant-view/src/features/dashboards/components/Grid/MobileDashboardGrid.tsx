import type { DashboardGraph, DashboardLayoutItem } from '@bv/api';
import { cn } from '@bv/ui';
import { useDashboardContext } from '~/features/dashboards';
import type { ViewFilter } from '~/filters/viewFilter';
import { useLocalize } from '~/i18n/I18nContext';
import { DashboardGraphView } from '~/site/dashboard/graph/DashboardGraphView';
import { useMemo } from 'react';
import type { Layout } from 'react-grid-layout';
import {
    applyGlobalFiltersToDashboardLayout,
    hasActiveGlobalFilterValues,
} from '../Filters/globalFilterUtils';
import type { DateFilterValue } from '../PredefinedDateRanges/dateFilterUtils';
import { EmptyDashboardCard } from './EmptyDashboardCard';

export type MobileDashboardCellDroppable = {
    graph?: DashboardGraph;
    layout?: DashboardLayoutItem;
};

type MobileDashboardGridProps = {
    layout: DashboardLayoutItem[];
};

type MobileLayoutItem = {
    gridLayout: Layout;
    dashboardLayout: DashboardLayoutItem;
    hasActiveFilters: boolean;
};

function toLayoutItem(
    layout: DashboardLayoutItem,
    hasActiveFilters: boolean,
    filterConcepts: ViewFilter[],
    dateRange: DateFilterValue | undefined,
    localize: (key: string, vars?: Record<string, string | number>) => string
): MobileLayoutItem {
    return {
        gridLayout: {
            i: layout.id.toString(),
            x: layout.x,
            y: layout.y,
            w: layout.width,
            h: layout.height,
            static: true, // ✅ Make elements static (no dragging or resizing)
        },
        dashboardLayout: applyGlobalFiltersToDashboardLayout(
            layout,
            filterConcepts,
            dateRange,
            localize
        ),
        hasActiveFilters,
    };
}

export function MobileDashboardGrid({ layout }: MobileDashboardGridProps) {
    const { globalConceptFilters, globalDateFilter } = useDashboardContext();
    const localize = useLocalize();
    const dateRange = globalDateFilter as DateFilterValue | undefined;

    const orderedLayouts = useMemo<MobileLayoutItem[]>(() => {
        const hasActiveFilters =
            hasActiveGlobalFilterValues(globalConceptFilters);

        return layout
            .slice()
            .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
            .map((layoutItem) =>
                toLayoutItem(
                    layoutItem,
                    hasActiveFilters,
                    globalConceptFilters,
                    dateRange,
                    localize
                )
            );
    }, [layout, globalConceptFilters, dateRange, localize]);

    return (
        <div className="mt-0 h-full w-screen px-2 lg:mt-0">
            <EmptyDashboardCard layout={layout} />
            <div className="pb-24">
                {orderedLayouts.map((layout) => (
                    <div
                        key={layout.gridLayout.i}
                        data-grid={layout.gridLayout}
                        className="mx-2 my-4"
                    >
                        <div
                            className={cn(
                                'flex h-full w-full justify-center',
                                'relative flex rounded-lg bg-primary shadow-xs'
                            )}
                        >
                            <DashboardGraphView
                                layout={layout.dashboardLayout}
                                hasActiveFilters={layout.hasActiveFilters}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
