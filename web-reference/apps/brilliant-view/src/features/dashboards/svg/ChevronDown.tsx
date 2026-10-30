import type { SvgProps } from './types';

export function ChevronDown(props: SvgProps) {
    const { height = 16, width = 16, ...rest } = props;
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path
                d="M6 9L11.6464 14.6464C11.8417 14.8417 12.1583 14.8417 12.3536 14.6464L18 9"
                stroke="#4B5565"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
