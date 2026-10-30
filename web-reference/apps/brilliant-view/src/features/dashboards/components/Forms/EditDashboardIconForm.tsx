import { Icon } from '@brilliant/bds-core';
import {
    cn,
    DASHBOARD_COLORS,
    DASHBOARD_ICON_NAMES,
    dashboardGradientStyles,
    DashboardIcon,
    parseDashboardColor,
} from '@bv/ui';
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useUpdateDashboard } from '../../mutations';
import { useDashboardMetaForm } from './dashboardMetaForm';
import type { BaseEditableDashboardProps } from './types';

const sizeConfigMap = {
    sm: {
        selectBox: 'w-8 h-8',
        colorSelectWrapper: 'gap-sm',
        iconSelectWrapper: 'grid-cols-4',
    },
    md: {
        selectBox: 'w-10 h-10',
        colorSelectWrapper: 'gap-md',
        iconSelectWrapper: 'grid-cols-5',
    },
} as const;

type EditDashboardIconFormProps = BaseEditableDashboardProps & {
    size?: keyof typeof sizeConfigMap;
};

export function EditDashboardIconForm({
    dashboard,
    size = 'md',
}: EditDashboardIconFormProps) {
    const form = useDashboardMetaForm(dashboard);
    const mutation = useUpdateDashboard(dashboard);
    const { watch } = form;
    const { mutateAsync } = mutation;
    const sizeConfig = sizeConfigMap[size] || sizeConfigMap.md;

    useEffect(() => {
        const subscription = watch(({ icon, color }) => {
            mutateAsync({ icon, color }).catch(console.error);
        });
        return () => subscription.unsubscribe();
    }, [mutateAsync, watch]);

    return (
        <form>
            <div
                className="space-y-0"
                data-component-name="EditDashboardIconForm"
            >
                <Controller
                    name="color"
                    control={form.control}
                    render={({ field }) => (
                        <div
                            className={cn(
                                'grid grid-cols-5 p-4xl',
                                sizeConfig.colorSelectWrapper
                            )}
                        >
                            {DASHBOARD_COLORS.map((color) => (
                                <div
                                    key={color}
                                    className={cn(
                                        'flex items-center justify-center rounded-sm',
                                        sizeConfig.selectBox,
                                        dashboardGradientStyles({
                                            color,
                                            clickable: true,
                                        })
                                    )}
                                    onClick={() =>
                                        form.setValue('color', color)
                                    }
                                >
                                    {field.value === color && (
                                        <Icon
                                            icon="bv:check"
                                            className="text-3xl"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                />
                <div className="border border-secondary" />
                <Controller
                    name="icon"
                    control={form.control}
                    render={({ field }) => (
                        <div
                            className={cn(
                                'grid gap-md p-4xl',
                                sizeConfig.iconSelectWrapper
                            )}
                        >
                            {DASHBOARD_ICON_NAMES.map((icon) => (
                                <DashboardIcon
                                    key={icon}
                                    icon={icon}
                                    color={
                                        field.value === icon
                                            ? parseDashboardColor(
                                                  dashboard.color
                                              )
                                            : 'transparent'
                                    }
                                    size="sm"
                                    clickable
                                    onClick={() => form.setValue('icon', icon)}
                                />
                            ))}
                        </div>
                    )}
                />
            </div>
        </form>
    );
}
