import type { SelectOption } from '@brilliant/bds-core';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Icon,
} from '@brilliant/bds-core';

type DashboardFilterProps = {
    label: string;
    value: string | null;
    options: SelectOption[];
    onChange: (value: SelectOption) => void;
    defaultValue?: string;
};

export function DashboardFilter({
    value,
    onChange,
    label,
    options,
    defaultValue,
}: DashboardFilterProps) {
    const defaultOption = defaultValue
        ? options.find((option) => option.value === defaultValue)
        : undefined;
    const selectedOption =
        options.find((option) => option.value === (value ?? defaultValue)) ??
        defaultOption;

    return (
        <div className="flex items-center gap-2">
            <div className="text-secondary bv-text-font-md-regular">
                {label}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <div className="flex items-center gap-0.5 rounded-md px-1 text-primary hover:bg-primary">
                        <span className="bv-text-font-md-medium">
                            {selectedOption?.label ?? 'None'}
                        </span>
                        <Icon icon="bv:chevron-down" className="text-xl" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-96 w-56 overflow-auto">
                    <DropdownMenuLabel>{label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {options.map((option, index) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={index}
                                checked={option.value === value}
                                onCheckedChange={() => onChange(option)}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
