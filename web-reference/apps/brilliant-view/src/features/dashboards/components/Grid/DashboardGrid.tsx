import type { DragItem } from '@brilliant/components';
import { DragDropContext, useDrop } from '@brilliant/components';
import type {
    DashboardConceptMetric,
    DashboardGraph,
    DashboardLayoutItem,
    UpdateDashboardLayoutBatchItem,
} from '@bv/api';
import { cn } from '@bv/ui';
import { useDashboardContext } from '~/features/dashboards';
import { useDashboardParams } from '~/features/dashboards/hooks/useDashboardParams';
import { useNewGraphStudioData } from '~/features/dashboards/hooks/useGraphStudioData';
import type { ViewFilter } from '~/filters/viewFilter';
import { useLocalize } from '~/i18n/I18nContext';
import { DashboardGraphView } from '~/site/dashboard/graph/DashboardGraphView';
import type { DashboardCellData } from '~/site/dashboard/types';
import { DASHBOARD_DRAG_DROP_TYPE } from '~/site/dashboard/types';
import { Children, useContext, useEffect, useMemo, useState } from 'react';
import type { Layout } from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
    applyGlobalFiltersToDashboardLayout,
    hasActiveGlobalFilterValues,
} from '../Filters/globalFilterUtils';
import type { DateFilterValue } from '../PredefinedDateRanges/dateFilterUtils';
import { EmptyDashboardCard } from './EmptyDashboardCard';

const ResponsiveGridLayout = WidthProvider(Responsive);

export type DashboardCellDroppable = {
    graph?: DashboardGraph;
    layout?: DashboardLayoutItem;
    metric?: DashboardConceptMetric;
};

type DashboardGridProps = {
    columns: number;
    rows: number;
    layout: DashboardLayoutItem[];
};

type LayoutItem = {
    gridLayout: Layout;
    dashboardLayout: DashboardLayoutItem;
    hasActiveFilters: boolean;
};

type HoverItem = {
    data: DashboardCellDroppable;
    layout: Layout;
};

function toLayoutItem(
    layout: DashboardLayoutItem,
    editMode: boolean,
    layoutFilter: ViewFilter[],
    dateRange: DateFilterValue | undefined,
    localize: (key: string, vars?: Record<string, string | number>) => string
): LayoutItem {
    const hasActiveFilters = hasActiveGlobalFilterValues(layoutFilter);

    return {
        gridLayout: {
            i: layout.id.toString(),
            x: layout.x,
            y: layout.y,
            minW: 3,
            minH: 2,
            w: layout.width,
            h: layout.height,
            static: !editMode,
        },
        dashboardLayout: applyGlobalFiltersToDashboardLayout(
            layout,
            layoutFilter,
            dateRange,
            localize
        ),
        hasActiveFilters,
    };
}

export function DashboardGrid({ columns, layout }: DashboardGridProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [hoverItem, setHoverItem] = useState<HoverItem | undefined>(
        undefined
    );

    const dashboardContext = useDashboardContext();
    const { globalConceptFilters, globalDateFilter } = dashboardContext;
    const { editMode } = useDashboardParams();
    const localize = useLocalize();
    const dateRange = globalDateFilter as DateFilterValue | undefined;

    const dashboardLayouts: LayoutItem[] = useMemo(
        () =>
            layout.map((layout) =>
                toLayoutItem(
                    layout,
                    editMode,
                    globalConceptFilters,
                    dateRange,
                    localize
                )
            ),
        [layout, editMode, globalConceptFilters, dateRange, localize]
    );

    const rows = useMemo(
        () =>
            dashboardLayouts.reduce(
                (acc, layout) =>
                    Math.max(acc, layout.gridLayout.y + layout.gridLayout.h),
                1
            ),
        [dashboardLayouts]
    );

    // Sync updates to backend
    function onLayoutChange(newLayout: Layout[]) {
        // Dont sync while hovering
        if (hoverItem != undefined) {
            return;
        }
        // Find all changed layouts and mutate
        const changedLayouts: UpdateDashboardLayoutBatchItem[] = [];
        newLayout.forEach((gridLayout) => {
            const dashboardLayout = layout.find(
                (l) => l.id.toString() == gridLayout.i
            );
            if (dashboardLayout !== undefined) {
                const xChange = gridLayout.x != dashboardLayout.x;
                const yChange = gridLayout.y != dashboardLayout.y;
                const wChange = gridLayout.w != dashboardLayout.width;
                const hChange = gridLayout.h != dashboardLayout.height;
                if (xChange || yChange || wChange || hChange) {
                    changedLayouts.push({
                        id: dashboardLayout.id,
                        x: gridLayout.x,
                        y: gridLayout.y,
                        width: gridLayout.w,
                        height: gridLayout.h,
                    });
                }
            }
        });
        if (changedLayouts.length > 0) {
            dashboardContext.moveElements(changedLayouts);
        }
    }

    const enableTransition = isDragging || isResizing || hoverItem != undefined;

    return (
        <div className="relative h-full w-full px-4xl">
            <EmptyDashboardCard layout={layout} />
            <DashboardGridDropZone
                columns={columns}
                rows={rows + 1}
                rowHeight={80}
                setHover={(item) => {
                    setHoverItem(item);
                }}
            />
            <ResponsiveGridLayout
                rowHeight={80}
                resizeHandles={['se']}
                onResizeStart={() => {
                    setIsResizing(true);
                }}
                onResizeStop={() => {
                    setIsResizing(false);
                }}
                onDragStart={() => {
                    setIsDragging(true);
                }}
                onDragStop={() => {
                    setIsDragging(false);
                }}
                margin={[24, 24]}
                containerPadding={[0, 0]}
                cols={{
                    lg: columns,
                    md: columns,
                    sm: columns,
                    xs: columns,
                    xxs: columns,
                }}
                className={cn({
                    noTransition: !enableTransition,
                })}
                onLayoutChange={(newLayout) => onLayoutChange(newLayout)}
            >
                {hoverItem && (
                    <div
                        key={hoverItem.layout.i}
                        data-grid={hoverItem.layout}
                        className="rounded-lg bg-primary opacity-50"
                    />
                )}
                {dashboardLayouts.map((layout) => (
                    <div
                        key={layout.gridLayout.i}
                        data-grid={layout.gridLayout}
                        className={cn({
                            'cursor-grabbing': editMode && isDragging,
                            'cursor-grab': editMode && !isDragging,
                        })}
                    >
                        <div
                            className={cn(
                                'h-full w-full overflow-hidden',
                                'relative flex rounded-lg bg-primary shadow-xs',
                                {
                                    'border-2 border-dashed border-primary':
                                        editMode,
                                    noTransition: !enableTransition,
                                }
                            )}
                            style={
                                {
                                    // TODOP this disables graph header too, but we want
                                    // it to be available in editmode to delete
                                    // userSelect: editMode ? "none" : undefined,
                                    // pointerEvents: editMode ? "none" : undefined,
                                }
                            }
                        >
                            <DashboardGraphView
                                layout={layout.dashboardLayout}
                                hasActiveFilters={layout.hasActiveFilters}
                            />
                        </div>
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}

type DashboardGridDropZoneProps = {
    columns: number;
    rows: number;
    rowHeight: number;
    setHover: (item?: HoverItem) => void;
};

/// Handles drag and drop cells from library sidepanel
function DashboardGridDropZone({
    columns,
    rows,
    rowHeight,
    setHover,
}: DashboardGridDropZoneProps) {
    const padRows = 4;
    const context = useContext(DragDropContext);

    useEffect(() => {
        if (context.drag === undefined && context.justDropped !== undefined) {
            setHover(undefined);
        }
    }, [context.drag, context.justDropped, setHover]);

    function renderCells() {
        const cells = [];
        for (let y = 0; y < rows + padRows; y++) {
            for (let x = 0; x < columns; x++) {
                cells.push(
                    <DashboardGridDropCell
                        row={y}
                        col={x}
                        columns={columns}
                        setHover={(item) => {
                            setHover(item);
                        }}
                    />
                );
            }
        }
        return cells;
    }

    return (
        <div
            className={cn({
                'absolute left-0 top-0 grid w-full bg-transparent': true,
                'pointer-events-none': context.drag == undefined,
            })}
            style={{
                height: rowHeight * (rows + padRows),
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                zIndex: context.drag !== undefined ? 1 : 1,
            }}
        >
            {Children.map(renderCells(), (child) => child)}
        </div>
    );
}

function DashboardGridDropCell({
    row,
    col,
    columns,
    setHover,
}: {
    row: number;
    col: number;
    columns: number;
    setHover: (item?: HoverItem) => void;
}) {
    const context = useContext(DragDropContext);
    const { setDashboardParams } = useDashboardParams();
    const { setNewGraphStudioData } = useNewGraphStudioData();
    const width = 5;
    const yPos = row;
    const xPos = Math.max(0, Math.min(col - 2, columns - width));
    const layout: Layout = {
        i: `${row}-${col}`,
        x: xPos,
        y: yPos,
        w: width,
        h: 4,
        isResizable: false,
        static: yPos == 0 && xPos != 0,
    };
    const drop = useDrop<DashboardCellDroppable, DashboardCellData>({
        id: layout.i,
        types: [DASHBOARD_DRAG_DROP_TYPE],
        handleHover(item: DashboardCellDroppable): DashboardCellData {
            setHover({ data: item, layout });
            return { id: 'dashboard' };
        },
        handleLeave() {
            setHover(undefined);
        },
        handleDrop(item: DragItem<DashboardCellDroppable>) {
            setHover(undefined);
            setNewGraphStudioData({
                metric: item.data.metric,
                layout: {
                    id: -1,
                    x: layout.x,
                    y: layout.y,
                    width,
                    height: 4,
                    graph: {} as DashboardGraph,
                },
            });
            setDashboardParams({
                editPane: 'graphStudio',
            });
        },
    });
    return (
        <div
            className={cn({
                'h-full w-full': true,
                'pointer-events-none': context.drag == undefined,
            })}
            style={{
                top: 0,
                left: 0,
                zIndex: context.drag !== undefined ? 1 : -1,
            }}
            {...drop.bindings}
        >
            <div className="hidden">
                {row}, {col}
            </div>
        </div>
    );
}
