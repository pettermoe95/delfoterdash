import type { PropsWithChildren } from 'react';
import { cn } from '../../utils';
import { Label } from './Label';

type InputWrapperProps = PropsWithChildren<{
    className?: string;
    label?: string;
}>;
export function FieldWrapper({
    children,
    label,
    className,
}: InputWrapperProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            {label && <Label>{label}</Label>}
            {children}
        </div>
    );
}
