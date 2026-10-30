import type { SvgProps } from './types';

export function CheckIcon(props: SvgProps) {
    const { stroke = 'currentColor', width, height, ...rest } = props;

    return (
        <svg
            width={width ?? 16}
            height={height ?? 16}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path
                d="M13.3307 4.66675L6.35017 11.0127C6.15268 11.1923 5.849 11.185 5.66028 10.9963L2.66406 8.00008"
                stroke={stroke}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
