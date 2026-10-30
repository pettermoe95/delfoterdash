import * as Label from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import React, { forwardRef, useEffect } from 'react';
import { Tooltip } from '../../Content';
import { Icon } from '../../Theme';
import styles from './TextField.module.scss';
import { TextFieldCopyButton } from './TextFieldCopyButton';

export const textFieldSizes = ['sm', 'md'] as const;
export type TextFieldSize = (typeof textFieldSizes)[number];

const textFieldRootStyles = cva(styles.TextFieldRoot, {
    variants: {
        error: {
            true: styles['TextFieldRoot--error'],
        },
    },
});
const inputGroupStyles = cva(styles.TextFieldInputGroup, {
    variants: {
        size: {
            sm: styles['TextFieldInputGroup--sm'] ?? '',
            md: styles['TextFieldInputGroup--md'] ?? '',
        } satisfies Record<TextFieldSize, string>,
        withAction: {
            true: styles['TextFieldInputGroup--with-action'] ?? '',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

interface TextFieldProps {
    // Input Props
    id?: string;
    type?: 'text' | 'number' | 'email' | 'password';
    label?: string;
    value?: string | number;
    name: string;
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    // Misc
    supportingText?: string;
    info?: string;
    leftIcon?: string;
    size?: TextFieldSize;
    copyable?: boolean;
    autoComplete?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
    (props: TextFieldProps, ref) => {
        const {
            id,
            type = 'text',
            leftIcon,
            label,
            value,
            name,
            placeholder,
            disabled,
            onChange,
            onBlur,
            supportingText,
            info,
            size,
            error,
            copyable,
            autoComplete,
        } = props;
        const [internalValue, setInternalValue] = React.useState<
            string | number
        >(value ?? '');

        function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
            const value = event.target.value;
            setInternalValue(value);
            onChange?.(event);
        }

        // Make sure that internal value is updated when the prop "value" changes.
        useEffect(() => {
            if (value !== undefined) {
                setInternalValue(value);
            }
        }, [value]);

        return (
            <div
                className={textFieldRootStyles({ error })}
                data-disabled={disabled ? true : undefined}
            >
                {label && (
                    <Label.Root
                        htmlFor={id ?? label}
                        className={styles.TextFieldLabel}
                    >
                        {label}
                    </Label.Root>
                )}
                <div className={styles.TextFieldWrapper}>
                    <div
                        className={inputGroupStyles({
                            size,
                            withAction: copyable,
                        })}
                    >
                        {leftIcon && (
                            <Icon
                                icon={leftIcon}
                                className={styles.TextFieldIcon}
                            />
                        )}
                        <input
                            ref={ref}
                            id={id ?? label}
                            className={styles.TextFieldInput}
                            name={name}
                            value={internalValue}
                            onChange={handleOnChange}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            disabled={disabled}
                            type={type}
                            autoComplete={autoComplete}
                        />
                        <TextFieldInfo info={info} error={error} />
                    </div>
                    <TextFieldCopyButton
                        value={internalValue}
                        copyable={copyable}
                        size={size}
                    />
                </div>
                {supportingText && (
                    <p className={styles.SupportingText}>{supportingText}</p>
                )}
            </div>
        );
    }
);

function TextFieldInfo(props: { info?: string; error?: boolean }) {
    if (!props.info) return null;

    return (
        <div
            className={clsx(
                styles.TextFieldInfo,
                props.error && styles['TextFieldInfo--error']
            )}
        >
            <Tooltip title={props.info} side="right" triggerAsChild={false}>
                <Icon icon="bv:info-circle" fontSize="var(--text-size-lg)" />
            </Tooltip>
        </div>
    );
}
