type ReferenceSelectProps = {
    id: string;
    value: unknown;
    options: { id: string; name: string }[];
    placeholder: string;
    missingLabel: string;
    onChange: (value: string) => void;
};

export function ReferenceSelect({
    id,
    value,
    options,
    placeholder,
    missingLabel,
    onChange,
}: ReferenceSelectProps) {
    const selected = typeof value === 'string' ? value : '';
    const renderOption = (option: (typeof options)[number]) => (
        <option key={option.id} value={option.id}>
            {option.name}
        </option>
    );
    return (
        <select
            id={id}
            value={selected}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">{placeholder}</option>
            {selected && !options.some((option) => option.id === selected) && (
                <option value={selected}>
                    {selected} ({missingLabel})
                </option>
            )}
            {options.map(renderOption)}
        </select>
    );
}
