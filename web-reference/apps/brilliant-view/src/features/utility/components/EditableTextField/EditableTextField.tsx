import { Icon, IconButton } from '@brilliant/bds-core';
import { cn } from '@bv/ui';
import { useDashboardParams } from '~/features/dashboards/hooks/useDashboardParams';
import { useEffect, useRef, useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

interface EditableTextFieldProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>;
    inputText: Path<TFieldValues>;
    placeholder?: string;
    onSubmit: (values: TFieldValues) => void;
    onCancel: () => void;
    headingClassName: string;
    width?: string;
    disabled?: boolean;
}

export function EditableTextField<TFieldValues extends FieldValues>({
    control,
    inputText,
    placeholder = '',
    onSubmit,
    onCancel,
    headingClassName,
    width = '15ch',
    disabled = false,
}: EditableTextFieldProps<TFieldValues>) {
    const { searchParams } = useDashboardParams();
    const isEditPaneOpen = searchParams.editPane !== undefined;

    const [isEditing, setIsEditing] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isEditingRef = useRef(isEditing);

    const handleCancel = () => {
        onCancel();
        setIsEditing(false);
    };

    const handleSubmitAndClose = () => {
        formRef.current?.requestSubmit();
        setIsEditing(false);
    };

    // Click outside to save
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                isEditingRef.current &&
                formRef.current &&
                !formRef.current.contains(event.target as Node)
            ) {
                handleSubmitAndClose();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus when entering edit mode
    useEffect(() => {
        isEditingRef.current = isEditing;
    }, [isEditing]);

    return isEditing ? (
        <form
            ref={formRef}
            onSubmit={control.handleSubmit(onSubmit)}
            className="flex items-center gap-2"
        >
            <div
                className={cn(
                    'flex items-stretch gap-3 overflow-hidden bg-primary',
                    'border border-solid border-primary',
                    'group rounded-md focus-within:shadow-brand'
                )}
            >
                {!isEditPaneOpen && (
                    <div className="flex items-center border-r border-primary bg-primary px-2">
                        <Icon icon="bv:pen" className="text-secondary" />
                    </div>
                )}
                <Controller
                    control={control}
                    name={inputText}
                    render={({ field }) => (
                        <input
                            {...field}
                            ref={inputRef}
                            className={headingClassName}
                            autoComplete="off"
                            placeholder={placeholder}
                            type="text"
                            style={{ width }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmitAndClose();
                                } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleCancel();
                                }
                            }}
                        />
                    )}
                />
                <IconButton
                    size="sm"
                    icon="bv:close"
                    variant="ghost"
                    color="gray"
                    type="button"
                    onClick={() => {
                        handleCancel();
                    }}
                />
            </div>
        </form>
    ) : (
        <Controller
            control={control}
            name={inputText}
            render={({ field }) => (
                <span
                    className={cn(headingClassName, disabled)}
                    onDoubleClick={() => {
                        if (!disabled) {
                            setIsEditing(true);
                        }
                    }}
                >
                    {field.value || placeholder}
                </span>
            )}
        />
    );
}
