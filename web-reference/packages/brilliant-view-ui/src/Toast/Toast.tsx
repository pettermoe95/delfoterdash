import { Icon } from '@brilliant/bds-core';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../utils/styles';

const VARIANT_STYLES = {
    success: {
        container:
            'border-success-solid bg-success-primary text-success-primary',
        badge: 'border-success-solid text-success-primary',
        icon: 'bv:check',
        iconColor: 'text-success-primary',
        ariaLive: 'polite' as const,
    },
    error: {
        container: 'border-error-solid bg-error-primary text-error-primary',
        badge: 'border-error-solid text-error-primary',
        icon: 'bv:alert-circle',
        iconColor: 'text-error-primary',
        ariaLive: 'assertive' as const,
    },
    warning: {
        container:
            'border-warning-solid bg-warning-primary text-warning-primary',
        badge: 'border-warning-solid text-warning-primary',
        icon: 'bv:alert-triangle',
        iconColor: 'text-warning-primary',
        ariaLive: 'polite' as const,
    },
    info: {
        container: 'border-primary bg-primary text-primary',
        badge: 'border-primary text-primary',
        icon: 'bv:info-circle',
        iconColor: 'text-primary',
        ariaLive: 'polite' as const,
    },
};

const POSITION_STYLES = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
} as const;

export type ToastVariant = keyof typeof VARIANT_STYLES;
export type ToastPosition = keyof typeof POSITION_STYLES;

export type ToastProps = {
    open: boolean;
    message: string;
    description?: string;
    variant?: ToastVariant;
    icon?: ReactNode;
    action?: ReactNode;
    position?: ToastPosition;
    autoHideDuration?: number | null;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    closable?: boolean;
    onClose?: () => void;
    inline?: boolean;
};

export function Toast({
    open,
    message,
    description,
    variant = 'success',
    icon,
    action,
    position = 'bottom-right',
    autoHideDuration = 4000,
    onOpenChange,
    className,
    closable = false,
    onClose,
    inline = false,
}: ToastProps) {
    useEffect(() => {
        if (
            !open ||
            autoHideDuration === null ||
            onOpenChange === undefined ||
            typeof window === 'undefined'
        ) {
            return;
        }

        const timeoutId = window.setTimeout(
            () => onOpenChange(false),
            autoHideDuration
        );

        return () => window.clearTimeout(timeoutId);
    }, [open, autoHideDuration, onOpenChange]);

    if (!open) {
        return null;
    }

    const style = VARIANT_STYLES[variant];
    const closeToast = () => {
        onClose?.();
        onOpenChange?.(false);
    };

    return (
        <div
            className={cn(
                inline
                    ? 'pointer-events-none'
                    : 'pointer-events-none fixed z-50',
                !inline && POSITION_STYLES[position]
            )}
        >
            <div
                className={cn(
                    'pointer-events-auto relative flex min-w-[260px] max-w-sm items-center justify-center gap-sm rounded-sm border-t-2 px-3 py-1.5 shadow-sm',
                    style.container,
                    className
                )}
                role="status"
                aria-live={style.ariaLive}
            >
                {icon ?? (
                    <Icon
                        icon={style.icon}
                        className={cn('h-4 w-4', style.iconColor)}
                    />
                )}
                <div className="flex flex-1 flex-col gap-1">
                    <p className="bv-text-font-sm-medium">{message}</p>
                    {description && (
                        <p className="text-tertiary bv-text-font-xs-regular">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="ml-4">{action}</div>}
                {closable && (
                    <button
                        type="button"
                        aria-label="Close"
                        className="focus-visible:ring-brand absolute -left-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-primary bg-primary text-primary shadow-sm hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2"
                        onClick={closeToast}
                    >
                        <Icon icon="bv:close" className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
