interface TruncateTextProps {
    text: string | undefined;
    maxLength?: number;
}

export const truncateText = ({
    text,
    maxLength = 40, // Default max length
}: TruncateTextProps) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - 3) + '...';
};
