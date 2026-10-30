import type { LocalizeFn } from '@bv/i18n-utils';
import * as Label from '@radix-ui/react-label';
import * as Popover from '@radix-ui/react-popover';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../Theme';
import { cn } from '../../utils';
import styles from './components/Select.module.scss';
import { getSearchableLabel } from './utils';

const defaultStrings: Record<string, string> = {
    'miscTerms.search': 'Search',
    'filters.noResults': 'No data found for current filters',
};

export type SelectOption = {
    label: React.ReactNode;
    value: string;
};

type ComboBoxProps = {
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    disabled?: boolean;
    error?: boolean;
    multiple?: boolean;
    maxItems?: number;
    classes?: {
        trigger?: string;
        content?: string;
        item?: string;
        label?: string;
        selectedList?: string;
    };
    localizeFn?: LocalizeFn;
    allowCustomValue?: boolean;
    expand?: boolean;
    onOpenChange?: (open: boolean) => void;
    portalled?: boolean;
    avoidCollisions?: React.ComponentPropsWithoutRef<
        typeof Popover.Content
    >['avoidCollisions'];
    collisionBoundary?: React.ComponentPropsWithoutRef<
        typeof Popover.Content
    >['collisionBoundary'];
};

const popoverTriggerStyles = [
    'box-border flex w-full items-center justify-between gap-2',
    'rounded-sm border border-solid border-primary',
    'bg-primary px-lg py-md text-sm text-primary',
    'bv-text-font-sm-regular placeholder:text-placeholder',
    'focus:shadow-brand disabled:cursor-not-allowed disabled:opacity-50',
];

const expandedTriggerStyles = ['min-h-[38px]', 'py-2'];

const popoverContentStyles = [
    'relative z-50 rounded-sm bv-text-font-sm-regular',
    'min-w-[var(--radix-select-trigger-width)]',
    'border border-solid border-secondary',
    'bg-primary text-primary shadow-md',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
];

const optionRowBaseClasses =
    'flex cursor-pointer items-center gap-2 rounded px-3 py-2 bv-text-font-sm-regular active:bg-secondary-hover';

export function ComboBox({
    label,
    placeholder = 'Select...',
    options,
    value,
    onChange,
    disabled,
    multiple = false,
    maxItems,
    classes,
    localizeFn,
    allowCustomValue = false,
    expand = false,
    onOpenChange,
    portalled = true,
    avoidCollisions,
    collisionBoundary,
}: ComboBoxProps) {
    const localize =
        localizeFn ?? ((key: string) => defaultStrings[key] ?? key);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [triggerHeight, setTriggerHeight] = useState(0);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const optionsListRef = useRef<HTMLDivElement | null>(null);
    const trimmedSearchQuery = searchQuery.trim();

    const selectedValues = useMemo(
        () => (value ? [value].flat() : []),
        [value]
    );

    const selectedOptions = useMemo(() => {
        return selectedValues.map((selectedValue) => {
            const matchingOption = options.find(
                (o) => o.value === selectedValue
            );
            return (
                matchingOption ?? {
                    label: selectedValue,
                    value: selectedValue,
                }
            );
        });
    }, [options, selectedValues]);

    const filteredOptions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return options;
        }

        const prefixMatches: SelectOption[] = [];
        const substringMatches: SelectOption[] = [];

        options.forEach((option) => {
            const labelString = getSearchableLabel(option.label).toLowerCase();

            if (!labelString.includes(query)) {
                return;
            }

            if (labelString.startsWith(query)) {
                prefixMatches.push(option);
            } else {
                substringMatches.push(option);
            }
        });

        return [...prefixMatches, ...substringMatches];
    }, [options, searchQuery]);

    const isAtMax =
        multiple && maxItems !== undefined && selectedValues.length >= maxItems;

    const toggleSelect = (selectedValue: string) => {
        if (multiple) {
            if (selectedValues.includes(selectedValue)) {
                onChange(selectedValues.filter((v) => v !== selectedValue));
            } else if (!isAtMax) {
                onChange([...selectedValues, selectedValue]);
            }
        } else {
            onChange(selectedValue);
            setOpen(false);
        }
    };

    const commitCustomValue = () => {
        if (!allowCustomValue) return false;
        const customValue = trimmedSearchQuery;
        if (!customValue) return false;
        toggleSelect(customValue);
        setSearchQuery('');
        return true;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const lastIndex = filteredOptions.length - 1;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex((prev) => (prev < lastIndex ? prev + 1 : 0));
                break;

            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : lastIndex));
                break;

            case 'Enter':
                if (focusedIndex >= 0) {
                    e.preventDefault();
                    const selected = filteredOptions[focusedIndex];
                    if (selected) {
                        toggleSelect(selected.value);
                    }
                } else if (commitCustomValue()) {
                    e.preventDefault();
                }
                break;

            case 'Escape':
                setOpen(false);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (!open) {
            setFocusedIndex(-1);
        }
    }, [open]);

    useEffect(() => {
        setFocusedIndex(-1);
    }, [searchQuery]);

    useEffect(() => {
        const focusedOption = optionRefs.current[focusedIndex];
        if (focusedIndex >= 0 && focusedOption) {
            focusedOption.scrollIntoView({
                block: 'nearest',
                behavior: 'auto',
            });
        }
    }, [focusedIndex]);

    useEffect(() => {
        if (!expand || !multiple) return;

        const triggerElement = triggerRef.current;
        if (!triggerElement) return;

        const updateTriggerHeight = () => {
            const nextHeight = triggerElement.getBoundingClientRect().height;
            setTriggerHeight((current) =>
                Math.abs(current - nextHeight) > 0.5 ? nextHeight : current
            );
        };

        updateTriggerHeight();

        const observer = new ResizeObserver(updateTriggerHeight);
        observer.observe(triggerElement);

        return () => observer.disconnect();
    }, [expand, multiple]);

    const triggerLabel = !selectedOptions.length ? (
        <span className="min-w-0 flex-1 truncate text-placeholder">
            {placeholder}
        </span>
    ) : !multiple ? (
        <span className="min-w-0 flex-1 truncate">
            {selectedOptions[0]?.label}
        </span>
    ) : expand ? (
        <div className="flex max-h-[88px] flex-1 flex-wrap gap-1 overflow-y-auto py-0 pr-1">
            {selectedOptions.map((option) => (
                <span
                    key={option.value}
                    className="inline-flex max-w-full items-center rounded bg-secondary px-2 py-0 text-xs leading-5 text-primary"
                >
                    <span className="max-w-full truncate">{option.label}</span>
                </span>
            ))}
        </div>
    ) : (
        <>
            <span className="truncate">{selectedOptions[0]?.label}</span>
            {selectedOptions.length > 1 && (
                <span className="ml-2 whitespace-nowrap rounded bg-secondary px-2 py-1 text-xs text-primary">
                    + {selectedOptions.length - 1} more
                </span>
            )}
        </>
    );

    const shouldShowCustomValueRow = useMemo(() => {
        if (!allowCustomValue) return false;
        if (!trimmedSearchQuery) return false;
        return !options.some(
            (option) =>
                option.value.toLowerCase() === trimmedSearchQuery.toLowerCase()
        );
    }, [allowCustomValue, trimmedSearchQuery, options]);

    const content = (
        <Popover.Content
            className={cn(popoverContentStyles, classes?.content)}
            style={{
                width: 'var(--radix-popover-trigger-width)',
            }}
            avoidCollisions={avoidCollisions}
            collisionBoundary={collisionBoundary}
            sideOffset={expand ? -triggerHeight : 0}
            side="bottom"
            align="start"
            onOpenAutoFocus={(event) => {
                event.preventDefault();
                requestAnimationFrame(() => {
                    searchInputRef.current?.focus();
                });
            }}
        >
            <div className="flex flex-col border-b border-primary bg-primary">
                {multiple && selectedOptions.length > 0 && (
                    <div
                        className={cn(
                            'flex flex-wrap gap-1 p-2',
                            classes?.selectedList
                        )}
                    >
                        {selectedOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleSelect(option.value)}
                                className="hover:bg-secondary/70 flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-primary hover:cursor-pointer"
                            >
                                <span>{option.label}</span>
                                <Icon icon="bv:close" className="text-xs" />
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex items-center pl-3">
                    <Icon
                        icon="bv:search"
                        className={cn(styles.SearchFieldIcon)}
                    />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={localize('miscTerms.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            'w-full bg-transparent p-2 bv-text-font-sm-regular',
                            styles.SearchFieldInput
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>

            <div
                ref={optionsListRef}
                className="max-h-48 overflow-y-auto overflow-x-hidden"
                onMouseLeave={() => setFocusedIndex(-1)}
                onWheelCapture={(event) => {
                    const list = optionsListRef.current;
                    if (!list) return;

                    const canScroll = list.scrollHeight > list.clientHeight;
                    if (!canScroll) return;

                    event.preventDefault();
                    event.stopPropagation();
                    list.scrollTop += event.deltaY;
                }}
            >
                {shouldShowCustomValueRow && (
                    <button
                        type="button"
                        className={cn(
                            optionRowBaseClasses,
                            'w-full text-left',
                            classes?.item
                        )}
                        onClick={() => commitCustomValue()}
                    >
                        {trimmedSearchQuery}
                    </button>
                )}
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => {
                        const isSelected = selectedValues.includes(
                            option.value
                        );
                        const isDisabled = isAtMax && !isSelected;

                        return (
                            <button
                                type="button"
                                key={option.value}
                                ref={(el) => (optionRefs.current[index] = el)}
                                aria-pressed={multiple ? isSelected : undefined}
                                className={cn(
                                    optionRowBaseClasses,
                                    'w-full text-left',
                                    isSelected && 'bg-brand-primary',
                                    focusedIndex === index &&
                                        !isDisabled &&
                                        !isSelected &&
                                        'bg-secondary-hover',
                                    isDisabled &&
                                        'cursor-not-allowed opacity-40',
                                    classes?.item
                                )}
                                onMouseEnter={() =>
                                    !isDisabled && setFocusedIndex(index)
                                }
                                onClick={() =>
                                    !isDisabled && toggleSelect(option.value)
                                }
                            >
                                {option.label}
                            </button>
                        );
                    })
                ) : (
                    <div className="p-2 text-sm text-secondary">
                        {localize('filters.noResults')}
                    </div>
                )}
            </div>
        </Popover.Content>
    );

    return (
        <div
            className={cn('flex flex-col gap-sm', !label && 'contents')}
            data-disabled={disabled}
        >
            {label && (
                <Label.Root
                    className={cn(
                        'text-secondary bv-text-font-sm-regular',
                        classes?.label
                    )}
                >
                    {label}
                </Label.Root>
            )}
            <Popover.Root
                open={open}
                onOpenChange={(nextOpen) => {
                    setOpen(nextOpen);
                    onOpenChange?.(nextOpen);
                }}
            >
                <Popover.Trigger
                    ref={triggerRef}
                    disabled={disabled}
                    className={cn(
                        popoverTriggerStyles,
                        multiple && expand && expandedTriggerStyles,
                        classes?.trigger
                    )}
                >
                    {multiple && expand ? (
                        <div className="min-w-0 flex-1">{triggerLabel}</div>
                    ) : (
                        <span className="min-w-0 flex-1 truncate">
                            {triggerLabel}
                        </span>
                    )}
                    <Icon icon={open ? 'bv:chevron-up' : 'bv:chevron-down'} />
                </Popover.Trigger>
                {portalled ? (
                    <Popover.Portal>{content}</Popover.Portal>
                ) : (
                    content
                )}
            </Popover.Root>
        </div>
    );
}
