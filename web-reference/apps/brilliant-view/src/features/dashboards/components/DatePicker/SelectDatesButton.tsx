import { Button } from '@brilliant/bds-core';
import React, { forwardRef } from 'react';
import { CalendarIcon } from '../../svg/Calendar';

type Extras = {
    open: boolean;
    isActive: boolean;
    setOpen?: (isOpen: boolean) => void;
    color?: string;
    localize: (key: string) => string;
};

// React Spectrum injects onPress; we bridge it via onClick.
type TriggerInjection = {
    onPress?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

// Omit 'color' so our fixed value doesn't get overwritten by a string-typed color
type Native = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>;

type Props = Extras & TriggerInjection & Native;

export const SelectDatesButton = forwardRef<HTMLButtonElement, Props>(
    (
        {
            open,
            setOpen,
            isActive = false,
            color,
            localize,
            onPress,
            onClick,
            ...rest
        },
        ref
    ) => (
        <Button
            ref={ref}
            type="button"
            variant={isActive ? 'filled' : 'outlined'}
            size="sm"
            color={isActive ? 'primary' : 'gray'}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={(e) => {
                onClick?.(e);
                setOpen?.(true);
                onPress?.(e);
            }}
            {...rest}
        >
            <span className="'text-inherit' flex items-center gap-2">
                <CalendarIcon
                    label="Date picker"
                    color={isActive ? undefined : color}
                    className="text-inherit"
                    aria-hidden
                />
                <span className="text-inherit">
                    {localize('time.datePicker')}
                </span>
            </span>
        </Button>
    )
);
SelectDatesButton.displayName = 'SelectDateButton';
