import { primitives } from '@bv/design-tokens';
import { useState } from 'react';
import type { DashboardColor } from '../Dashboard';
import style from './SerieTypeAndColorPicker.module.scss';

interface ColorIconProps extends React.HTMLAttributes<HTMLDivElement> {
    color: DashboardColor;
    selected: boolean;
}

const ColorIcon = ({ color = 'blue', selected = false }: ColorIconProps) => {
    const [hovered, setHovered] = useState(false);
    const { dashboard } = primitives.colors;
    return (
        <div
            onMouseOver={() => setHovered(true)}
            onMouseOut={() => setHovered(false)}
            data-componentname="color-icon"
            className={style.colorIcon}
        >
            <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                shapeRendering="geometricPrecision"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Outer border */}
                <circle cx="10" cy="10" r="9.5" stroke="none" />
                {(selected || hovered) && (
                    <circle
                        cx="10"
                        cy="10"
                        r="9.5"
                        stroke={dashboard[color][600]}
                        strokeWidth="1"
                        fill="none"
                    />
                )}
                {/* Filled color circle */}
                <circle cx="10" cy="10" r="8" fill={dashboard[color][600]} />
                {selected && (
                    <path
                        d="M14 7.5L8.85277 12.1793C8.65528 12.3588 8.35161 12.3516 8.16288 12.1629L6 10"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                )}
            </svg>
        </div>
    );
};

export default ColorIcon;
export { ColorIcon };
