import * as Label from '@radix-ui/react-label';
import type { ComponentProps, ReactNode } from 'react';
import { truncateText } from '../../Utility/truncateText';
import type { Maybe } from '../../utils';
import { cn } from '../../utils';
import { Select, SelectContent, SelectItem, SelectTrigger } from './components';
import { VirtualizedSelect } from './VirtualizedSelect';

export type SelectOption = {
    label: ReactNode;
    value: string;
    description?: string;
};

type SelectClasses = {
    trigger?: string;
    content?: string;
    item?: string;
    label?: string;
    supportingText?: string;
};

type RootSelectProps = ComponentProps<typeof Select>;
type SingleSelectProps = {
    classes?: SelectClasses;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    error?: boolean;
    id?: string;
    label?: string;
    name?: string;
    options: SelectOption[] | string[];
    placeholder?: string;
    supportingText?: string;
    value?: Maybe<RootSelectProps['value']>;
    onChange?: RootSelectProps['onValueChange'];
    renderViewport?: boolean;
};

export function SingleSelect({
    classes,
    size,
    disabled,
    error,
    id,
    label,
    name,
    options,
    placeholder,
    supportingText,
    value,
    onChange,
    renderViewport = false,
}: SingleSelectProps) {
    const parsedOptions = options.map((option) =>
        typeof option === 'string' ? { label: option, value: option } : option
    );

    const selectedOption = parsedOptions.find(
        (option) => option.value === value
    )?.label;

    return (
        <div
            className={cn('flex flex-col gap-sm', !label && 'contents')}
            data-disabled={disabled}
        >
            {label && (
                <Label.Root
                    htmlFor={id ?? label}
                    className={cn(
                        'text-secondary bv-text-font-sm-medium',
                        classes?.label
                    )}
                >
                    {label}
                </Label.Root>
            )}
            <Select
                name={name}
                value={value ?? undefined}
                onValueChange={onChange}
                disabled={disabled}
            >
                <SelectTrigger
                    id={id}
                    size={size}
                    className={cn(error && 'border-error focus:shadow-error')}
                    aria-label={label}
                >
                    {typeof selectedOption === 'string'
                        ? truncateText({
                              text: selectedOption,
                              maxLength: 25,
                          })
                        : (selectedOption ?? placeholder)}
                </SelectTrigger>
                <SelectContent className={classes?.content}>
                    {renderViewport ? (
                        <div
                            className="w-full"
                            onWheel={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <VirtualizedSelect
                                options={parsedOptions}
                                onChange={(value) => {
                                    onChange?.(value);
                                }}
                                selectedValues={value ? [value] : []}
                                rowRender={({ option }) => (
                                    <SelectItem
                                        value={option.value}
                                        key={option.value}
                                        className={cn(
                                            classes?.item,
                                            'cursor-pointer'
                                        )}
                                    >
                                        {option.label}
                                    </SelectItem>
                                )}
                            />
                        </div>
                    ) : (
                        parsedOptions.map((option) => (
                            <SelectItem
                                value={option.value}
                                key={option.value}
                                className={classes?.item}
                            >
                                {option.label}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
            {supportingText && (
                <p
                    className={cn(
                        'text-primary bv-text-font-sm-light',
                        error && 'text-error-primary',
                        classes?.supportingText
                    )}
                >
                    {supportingText}
                </p>
            )}
        </div>
    );
}
