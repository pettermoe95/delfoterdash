import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { DashboardColor } from '.';

export const dashboardGradientStyles = cva(
    'focus:shadow-ring-brand bg-gradient-to-r text-fg-white',
    {
        variants: {
            gradient: {
                left: 'bg-gradient-to-l',
                right: 'bg-gradient-to-r',
                top: 'bg-gradient-to-t',
                bottom: 'bg-gradient-to-b',
                'top-left': 'bg-gradient-to-tl',
                'top-right': 'bg-gradient-to-tr',
                'bottom-left': 'bg-gradient-to-bl',
                'bottom-right': 'bg-gradient-to-br',
            },
            color: {
                blue: 'from-dashboard-blue-600 to-dashboard-blue-500',
                teal: 'from-dashboard-teal-600 to-dashboard-teal-500',
                red: 'from-dashboard-red-600 to-dashboard-red-500',
                pink: 'from-dashboard-pink-600 to-dashboard-pink-500',
                green: 'from-dashboard-green-600 to-dashboard-green-500',
                purple: 'from-dashboard-purple-600 to-dashboard-purple-500',
                yellow: 'from-dashboard-yellow-600 to-dashboard-yellow-500',
                transparent:
                    'border border-primary bg-transparent text-fg-primary hover:bg-secondary',
            } satisfies Record<DashboardColor | 'transparent', unknown>,
            clickable: {
                true: 'cursor-pointer hover:brightness-95 dark:hover:brightness-105',
                false: 'pointer-events-none',
            },
        },
        defaultVariants: {
            color: 'blue',
            gradient: 'right',
        },
    }
);

export type DashboardGradientProps = VariantProps<
    typeof dashboardGradientStyles
>;
