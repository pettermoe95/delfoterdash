import type { DashboardColor } from '../../Theme';

export type FunnelGraphSeriesConfig = {
    legendIndex?: number;
    color?: DashboardColor;
    colors?: DashboardColor[];
    showLabelTimePeriod?: boolean;
    legendText?: string;
};

export type FunnelStep = {
    label: string;
    periodLabel?: string;
    fullLabel: string;
    value: number;
    color: string;
    unit?: string;
    seriesIndex: number;
};
