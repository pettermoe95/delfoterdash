import type { BVIconName } from '@brilliant/bds-core';
import type { primitives } from '@bv/design-tokens';
import { z } from 'zod';

export type DashboardColor = keyof typeof primitives.colors.dashboard;
export const DASHBOARD_COLORS = [
    'teal',
    'green',
    'blue',
    'yellow',
    'pink',
    'purple',
    'red',
] as const satisfies DashboardColor[];

const dashboardColorSchema = z.enum(DASHBOARD_COLORS).catch('blue');
export function parseDashboardColor(color: string | null): DashboardColor {
    return dashboardColorSchema.parse(color);
}

export const DASHBOARD_ICON_NAMES = [
    'analytics',
    'announcement',
    'academy',
    'book-open',
    'dashboard',
    'rocket',
    'report',
    'presentation',
] as const satisfies BVIconName[];

export type DashboardIconName = (typeof DASHBOARD_ICON_NAMES)[number];

const iconNameSchema = z.enum(DASHBOARD_ICON_NAMES).catch('dashboard');
export function parseDashboardIconName(
    iconName: string | null
): DashboardIconName {
    return iconNameSchema.parse(iconName);
}
