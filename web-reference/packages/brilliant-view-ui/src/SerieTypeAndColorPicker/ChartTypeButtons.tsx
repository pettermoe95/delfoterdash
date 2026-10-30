import { Tooltip } from '@brilliant/bds-core';
import { primitives } from '@bv/design-tokens';
import type { DashboardColor } from '@bv/ui';
import { cn } from '@bv/ui';
import ColorIcon from './ColorIcon';
import styles from './SerieTypeAndColorPicker.module.scss';

interface ChartTypeButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    color: DashboardColor;
    gradient: string;
    gradientUrl: string;
    type?: 'line' | 'bars';
    title: string;
}

const ChartTypeBarsButton = ({
    color,
    gradient,
    gradientUrl,
    title,
}: ChartTypeButtonProps) => {
    const { dashboard } = primitives.colors;

    return (
        <div
            className={styles.chartTypeButton}
            style={{
                ['--chart-type-color' as string]:
                    dashboard[color][100] || '#fff',
            }}
        >
            <Tooltip
                side="top"
                align="start"
                triggerAsChild={true}
                title={title}
            >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <defs>
                        <linearGradient
                            id={gradient}
                            x1="9"
                            y1="1.5"
                            x2="9"
                            y2="16.5"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor={dashboard[color][600]} />
                            <stop
                                offset="1"
                                stopColor={dashboard[color][500] ?? ''}
                            />
                        </linearGradient>
                    </defs>
                    <g transform="translate(4 2)">
                        <path
                            d="M14.5 16.5V1.5M7 16.5V6.5M-0.5 16.5V12.3333"
                            stroke={gradientUrl}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </g>
                </svg>
            </Tooltip>
        </div>
    );
};

const ChartTypeLineButton = ({
    color,
    gradient,
    gradientUrl,
    title,
}: ChartTypeButtonProps) => {
    const { dashboard } = primitives.colors;
    return (
        <div
            className={styles.chartTypeButton}
            style={{
                ['--chart-type-color' as string]:
                    dashboard[color][100] || '#fff',
            }}
        >
            <Tooltip
                side="top"
                align="start"
                triggerAsChild={true}
                title={title}
            >
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g transform="translate(0 0)">
                        <path
                            d="M5.33301 16L8.45717 12.251C8.57336 12.1116 8.77975 12.0907 8.92148 12.2041L11.7667 14.4803C11.8993 14.5864 12.0905 14.5758 12.2106 14.4557L18.6663 8"
                            stroke={gradientUrl}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </g>
                    <defs>
                        <linearGradient
                            id={gradient}
                            x1="5.33301"
                            y1="12"
                            x2="18.6663"
                            y2="12"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop
                                stopColor={
                                    primitives.colors.dashboard[color][600]
                                }
                            />
                            <stop
                                offset="1"
                                stopColor={
                                    primitives.colors.dashboard[color][500]
                                }
                            />
                        </linearGradient>
                    </defs>
                </svg>
            </Tooltip>
        </div>
    );
};

interface ChartColorSelectButtonProps {
    color: DashboardColor;
    selected?: boolean;
    selectColorHandler?: (color: DashboardColor) => void;
}
const ChartColorSelectButton = ({
    color,
    selected = false,
    selectColorHandler = (color: DashboardColor) => {
        console.log('Color selected:', color);
    },
}: ChartColorSelectButtonProps) => {
    return (
        <button
            data-selected={selected}
            key={color}
            type="button"
            className={cn(styles.chartColorSelectButton)}
            onClick={() => {
                selectColorHandler(color);
            }}
        >
            <ColorIcon
                color={color}
                selected={selected}
                className={styles.colorIcon}
            />
        </button>
    );
};

export default ChartTypeBarsButton;
export { ChartTypeBarsButton, ChartTypeLineButton, ChartColorSelectButton };
