import type { SvgProps } from './types';

export function Trash(props: SvgProps) {
    const { height = 12, width = 12, ...rest } = props;

    return (
        <svg
            data-component="trash"
            width={width}
            height={height}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <g clipPath="url(#clip0_4112_6683)">
                <path
                    d="M2.5 3L2.9414 10.0624C2.97434 10.5894 3.41139 11 3.93945 11H8.06055C8.58861 11 9.02566 10.5894 9.0586 10.0624L9.5 3M1.5 3H10.5M4 3V2C4 1.44772 4.44772 1 5 1H7C7.55228 1 8 1.44772 8 2V3M7 8.5V5.5M5 8.5V5.5"
                    stroke="#9AA4B2"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_4112_6683">
                    <rect width="12" height="12" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
