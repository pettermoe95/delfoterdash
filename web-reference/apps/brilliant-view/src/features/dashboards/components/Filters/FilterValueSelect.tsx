import type { SelectOption } from '@brilliant/bds-core';
import { ComboBox, SingleSelect } from '@brilliant/bds-core';
import { cn } from '@bv/ui';
import { useLocalize } from '~/i18n/I18nContext';

export type FilterValueMode =
    | 'include'
    | 'exclude'
    | 'between'
    | 'not_between'
    | 'is_null'
    | 'is_not_null';

type FilterValueSelectProps = {
    mode: FilterValueMode;
    modeOptions: SelectOption[];
    options: SelectOption[];
    values: string[];
    placeholder?: string;
    disabled?: boolean;
    onModeChange: (mode: FilterValueMode) => void;
    onValuesChange: (values: string[]) => void;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
};

const baseClasses = cn(
    'flex items-center justify-center border-r border-primary bg-tertiary text-secondary',
    'w-[131px] shrink-0',
    'hover:bg-secondary/40 hover: cursor-pointer bv-text-font-sm-regular hover:text-primary',
    'disabled:cursor-not-allowed disabled:opacity-50'
);

export function FilterValueSelect({
    mode,
    modeOptions,
    options,
    values,
    placeholder = 'Select...',
    disabled,
    onModeChange,
    onValuesChange,
    className,
    triggerClassName,
    contentClassName,
}: FilterValueSelectProps) {
    const localize = useLocalize();
    const isBetweenMode = mode === 'between' || mode === 'not_between';
    const isNullMode = mode === 'is_null' || mode === 'is_not_null';
    const betweenContentClassName = cn(
        contentClassName,
        '!min-w-[calc(var(--radix-popover-trigger-width)*2+1rem+1px)]',
        '!w-[calc(var(--radix-popover-trigger-width)*2+1rem+1px)]'
    );
    const betweenTriggerClassName = cn(
        'w-full min-w-0 max-w-full rounded-none border-0 bg-transparent',
        '[&>span]:min-w-0 [&>span]:max-w-full [&>span]:flex-1 [&>span]:truncate [&>span]:text-left',
        '[&>svg]:shrink-0',
        'px-2 py-1.5',
        'shadow-none focus:ring-0 focus:ring-offset-0',
        'text-primary bv-text-font-sm-regular',
        triggerClassName
    );

    const handleFilterChange = (value: string | string[]) => {
        const nextValues = Array.isArray(value)
            ? value
            : value && value !== ''
              ? [value]
              : [];
        onValuesChange(nextValues);
    };

    const handleBetweenChange = (value: string | string[], index: number) => {
        const nextValue = Array.isArray(value)
            ? (value[0] ?? '')
            : (value ?? '');
        const nextValues = [...values];
        nextValues[index] = nextValue;
        onValuesChange(nextValues);
    };

    return (
        <div
            className={cn(
                'flex items-stretch overflow-hidden rounded-sm border border-primary bg-primary',
                className
            )}
        >
            <div className={baseClasses}>
                <SingleSelect
                    size="sm"
                    value={mode}
                    disabled={disabled}
                    options={modeOptions}
                    aria-label="Filter mode"
                    onChange={(nextValue) =>
                        onModeChange(nextValue as FilterValueMode)
                    }
                />
            </div>
            <div className="min-w-0 flex-1">
                {isBetweenMode ? (
                    <div className="flex h-full w-full items-stretch">
                        <div className="w-1/2 min-w-0">
                            <ComboBox
                                disabled={disabled}
                                allowCustomValue
                                value={values[0] ?? ''}
                                onChange={(nextValue) =>
                                    handleBetweenChange(nextValue, 0)
                                }
                                options={options}
                                localizeFn={localize}
                                placeholder={localize('filters.from')}
                                classes={{
                                    trigger: betweenTriggerClassName,
                                    selectedList: 'hidden',
                                    content: betweenContentClassName,
                                }}
                            />
                        </div>
                        <div className="w-1/2 min-w-0">
                            <ComboBox
                                disabled={disabled}
                                allowCustomValue
                                value={values[1] ?? ''}
                                onChange={(nextValue) =>
                                    handleBetweenChange(nextValue, 1)
                                }
                                options={options}
                                localizeFn={localize}
                                placeholder={localize('filters.to')}
                                classes={{
                                    trigger: betweenTriggerClassName,
                                    selectedList: 'hidden',
                                    content: betweenContentClassName,
                                }}
                            />
                        </div>
                    </div>
                ) : isNullMode ? (
                    <div className="flex h-full items-center px-2 text-secondary bv-text-font-sm-regular hover:cursor-not-allowed"></div>
                ) : (
                    <ComboBox
                        multiple
                        allowCustomValue
                        disabled={disabled}
                        value={values}
                        onChange={handleFilterChange}
                        options={options}
                        localizeFn={localize}
                        placeholder={placeholder}
                        classes={{
                            trigger: cn(
                                'w-full rounded-none border-0 bg-transparent px-2 py-1.5',
                                triggerClassName
                            ),
                            selectedList:
                                'max-h-36 overflow-y-auto border-b border-primary',
                            content: contentClassName,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
