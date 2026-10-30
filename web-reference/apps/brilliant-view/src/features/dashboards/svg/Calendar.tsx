interface CalendarIconProps {
    label: string | undefined;
    color?: string;
    className?: string;
}
export function CalendarIcon({ label, color, className }: CalendarIconProps) {
    return (
        <svg
            width="14"
            height="16"
            viewBox="0 0 14 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={
                className ?? (label ? 'text-secondary' : 'text-placeholder')
            }
        >
            <path
                d="M3.66667 1.33398V4.00065M10.3333 1.33398V4.00065M1 6.66732H13M9.66667 9.00065L6.23518 12.1202C6.10352 12.2399 5.90107 12.2351 5.77525 12.1092L4.33333 10.6673M1 3.66732V13.6673C1 14.2196 1.44772 14.6673 2 14.6673H12C12.5523 14.6673 13 14.2196 13 13.6673V3.66732C13 3.11503 12.5523 2.66732 12 2.66732H2C1.44772 2.66732 1 3.11503 1 3.66732Z"
                stroke={color ?? 'currentColor'}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
