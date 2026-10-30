'use client';

import type { LabelProps } from '@radix-ui/react-label';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as React from 'react';
import { Icon } from '../../Theme';
import { cn } from '../../utils';
import { Label } from '../Form';

const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn('grid gap-2', className)}
            {...props}
            ref={ref}
        />
    );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupButton = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cn(
                'aspect-square h-4 w-4 rounded-full bg-primary',
                'border border-solid border-brand-primary-solid text-fg-brand-primary',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-brand-500 focus-visible:ring-opacity-25',
                'hover:border-brand-primary-solid-hover hover:bg-brand-primary hover:text-primary-brand-700 dark:hover:text-primary-brand-50',
                'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled disabled:text-disabled disabled:hover:bg-disabled',
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Icon
                    icon="mdi:circle"
                    className="h-2.5 w-2.5 fill-current text-current"
                />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
});
RadioGroupButton.displayName = 'RadioGroupButton';

type RadioGroupItemProps = React.ComponentPropsWithoutRef<
    typeof RadioGroupButton
> & {
    id: string;
    label?: string;
    supportingText?: string;
};

function RadioGroupItem({
    id,
    value,
    label,
    supportingText,
    className,
    ...radioItemProps
}: RadioGroupItemProps) {
    return (
        <div className={cn('flex items-start space-x-2', className)}>
            <RadioGroupButton id={id} value={value} {...radioItemProps} />
            {label && (
                <RadioGroupLabel
                    htmlFor={id}
                    label={label}
                    supportingText={supportingText}
                />
            )}
        </div>
    );
}

RadioGroupItem.displayName = RadioGroupPrimitive.RadioGroupItem.displayName;

type RadioGroupLabelProps = LabelProps & {
    label: string;
    supportingText?: string;
};

function RadioGroupLabel({
    label,
    supportingText,
    ...props
}: RadioGroupLabelProps) {
    return (
        <div className="flex flex-col">
            <Label htmlFor={props.htmlFor} {...props}>
                {label}
            </Label>
            {supportingText && (
                <p className="text-secondary bv-text-font-xs-regular">
                    {supportingText}
                </p>
            )}
        </div>
    );
}

export { RadioGroup, RadioGroupItem };
