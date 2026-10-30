import type { SvgProps } from './types';

export function Plus(props: SvgProps) {
    const { height = 18, width = 18, stroke = '#4B5565', ...rest } = props;

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path
                d="M7.99992 3.33325V12.6666M3.33325 7.99992H12.6666"
                stroke={stroke}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
