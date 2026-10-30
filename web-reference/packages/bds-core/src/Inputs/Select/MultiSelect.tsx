import * as Label from '@radix-ui/react-label';
import * as Popover from '@radix-ui/react-popover';
import React, { useState } from 'react';
import { Icon } from '../../Theme';
import { cn } from '../../utils';
import { getSearchableLabel } from './utils';
import { VirtualizedSelect } from './VirtualizedSelect';

export type SelectOptionMulti = {
    label: React.ReactNode;
    value: string;
};

type MultiSelectProps = {
    label?: string;
    placeholder?: string;
    options: SelectOptionMulti[];
    value: string[]; // Array for multiple selections
    onChange: (values: string[]) => void;
    disabled?: boolean;
    error?: boolean;
    renderViewport?: boolean;
    classes?: {
        trigger?: string;
        content?: string;
        item?: string;
        label?: string;
        chip?: string;
    };
};

export function MultiSelect({
    label,
    placeholder = 'Select...',
    options,
    value,
    onChange,
    disabled,
    renderViewport = false,
    classes,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleValue = (selectedValue: string) => {
        const newValues = value.includes(selectedValue)
            ? value.filter((v) => v !== selectedValue) // Remove if already selected
            : [...value, selectedValue]; // Add if not selected
        onChange(newValues);
    };

    const filteredOptions = options.filter((option) =>
        getSearchableLabel(option.label)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={cn('flex flex-col gap-sm', !label && 'contents')}
            data-disabled={disabled}
        >
            {label && (
                <Label.Root
                    className={cn(
                        'text-secondary bv-text-font-sm-medium',
                        classes?.label
                    )}
                >
                    {label}
                </Label.Root>
            )}
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger
                    disabled={disabled}
                    className={cn(
                        'box-border flex w-full items-center justify-between',
                        'rounded-sm border border-solid border-primary',
                        'bg-primary px-lg py-md text-sm text-primary',
                        'bv-text-font-md-regular placeholder:text-placeholder',
                        'focus:shadow-brand disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
                        classes?.trigger
                    )}
                >
                    <div className="flex max-h-[120px] flex-wrap items-center gap-1 overflow-auto">
                        {value.length > 0 ? (
                            value.map((val) => {
                                const option = options.find(
                                    (opt) => opt.value === val
                                );
                                return (
                                    <span
                                        key={val}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent dropdown from closing
                                            toggleValue(val);
                                        }}
                                        className={cn(
                                            'relative flex cursor-default items-center rounded-sm',
                                            'px-lg py-sm text-sm outline-none focus:bg-active',
                                            'hover:bg-active',
                                            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                                            classes?.chip
                                        )}
                                    >
                                        {option?.label}
                                        <Icon
                                            icon="bv:close"
                                            className="cursor-pointer text-sm"
                                        />
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-gray-400">{placeholder}</span>
                        )}
                    </div>
                    <Icon icon="bv:chevron-down" />
                </Popover.Trigger>
                <Popover.Content
                    className={cn(
                        'relative z-50 max-h-96 overflow-hidden rounded-sm',
                        'min-w-[var(--radix-select-trigger-width)]',
                        'border border-solid border-secondary',
                        'bg-primary text-primary shadow-md',
                        // Animation styles
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
                        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                        classes?.content
                    )}
                    style={{
                        maxHeight: '12rem',
                        overflowY: 'auto',
                        width: 'var(--radix-popover-trigger-width)',
                    }}
                    side="bottom"
                    align="start"
                >
                    {renderViewport ? (
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mb-2 w-full rounded border border-gray-300 p-2"
                            />
                            <VirtualizedSelect
                                options={filteredOptions}
                                onChange={(value) => toggleValue(value)}
                                selectedValues={value}
                                rowRender={({ option }) => (
                                    <div
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-active active:bg-active',
                                            value.includes(option.value) &&
                                                'bg-active',
                                            classes?.item
                                        )}
                                    >
                                        {option.label}
                                    </div>
                                )}
                            />
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mb-2 w-full rounded border border-gray-300 p-2"
                            />
                            {filteredOptions.map((option) => {
                                const isSelected = value.includes(option.value);
                                const onToggle = () =>
                                    toggleValue(option.value);

                                return (
                                    <div
                                        key={option.value}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-active active:bg-active',
                                            isSelected && 'bg-active',
                                            classes?.item
                                        )}
                                        onClick={onToggle}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={onToggle}
                                            className="cursor-pointer"
                                        />
                                        {option.label}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </Popover.Content>
            </Popover.Root>
        </div>
    );
}
