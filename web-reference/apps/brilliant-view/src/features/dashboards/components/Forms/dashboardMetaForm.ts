import type { Dashboard } from '@bv/api';
import {
    DASHBOARD_COLORS,
    DASHBOARD_ICON_NAMES,
    parseDashboardColor,
    parseDashboardIconName,
} from '@bv/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseFormProps } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const updateDashboardMetaSchema = z.object({
    name: z.string().min(1, 'Name must be at least 1 character long'),
    color: z.enum(DASHBOARD_COLORS).optional(),
    icon: z.enum(DASHBOARD_ICON_NAMES).optional(),
});

export type DashboardMetaForm = z.infer<typeof updateDashboardMetaSchema>;

type DashboardMetaFormOptions = Omit<
    UseFormProps<DashboardMetaForm>,
    'resolver' | 'defaultValues'
>;

export function useDashboardMetaForm(
    dashboard: Dashboard,
    options: DashboardMetaFormOptions = {}
) {
    return useForm<DashboardMetaForm>({
        ...options,
        defaultValues: {
            name: dashboard.name,
            color: parseDashboardColor(dashboard.color),
            icon: parseDashboardIconName(dashboard.icon),
        },
        resolver: zodResolver(updateDashboardMetaSchema),
    });
}
