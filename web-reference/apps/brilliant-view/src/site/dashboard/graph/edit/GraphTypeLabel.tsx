import { Icon } from '@brilliant/bds-core';
import type { DashboardGraphType } from '@bv/api';

type GraphTypeLabelProps = {
    graphType: DashboardGraphType;
    localize: (key: string) => string;
};

const defaultIconName = 'bv:placeholder';
const iconNameByGraphName: Record<string, string> = {
    axis: 'bv:bar-line-chart',
    pie: 'bv:pie-chart',
    gauge: 'bv:gauge',
    cylinder: 'mdi:crop-portrait',
    status: 'bv:trend',
    progress: 'bv:progress-bar',
    table: 'bv:table',
    funnel: 'mdi:filter-outline',
};

export function GraphTypeLabel({ graphType, localize }: GraphTypeLabelProps) {
    const iconName = iconNameByGraphName[graphType.name] ?? defaultIconName;

    const labelTextByGraphName: Record<string, string> = {
        axis: localize('graphs.axis'),
        pie: localize('graphs.pie'),
        gauge: localize('graphs.gauge'),
        cylinder: localize('graphs.cylinder'),
        status: localize('graphs.status'),
        table: localize('graphs.table'),
        funnel: localize('graphs.funnel'),
    };

    const labelText =
        labelTextByGraphName[graphType.name] ??
        graphType.name
            .split('-')
            .map((word: string) => word[0].toUpperCase() + word.slice(1))
            .join(' ');

    return (
        <div className="flex items-center gap-md">
            <Icon icon={iconName} className="text-xl" />
            <span>{labelText}</span>
        </div>
    );
}
