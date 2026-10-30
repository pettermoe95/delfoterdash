import type { SvgProps } from './types';

export function ChevronUp(props: SvgProps) {
    const { height = 16, width = 16, ...rest } = props;
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
                d="M4 10L7.64645 6.35355C7.84171 6.15829 8.15829 6.15829 8.35355 6.35355L12 10"
                className="fg-tertiary"
                stroke="#4B5565"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
