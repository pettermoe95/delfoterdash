import { createSafeContext } from '@brilliant/bds-core';
import type { PropsWithChildren } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ToastVariant } from './Toast';

const TOAST_EXIT_DURATION_MS = 250;
const DEFAULT_TOAST_DURATION_MS = 4000;

export type ToastType = ToastVariant;

export type DisplayToastParams = {
    type: ToastType;
    text: string;
    duration?: number;
    closable?: boolean;
};

export type ToastItem = {
    id: string;
    type: ToastType;
    text: string;
    duration: number;
    closable: boolean;
    isClosing: boolean;
};

export type ToastContextValue = {
    toasts: ToastItem[];
    displayToast: (params: DisplayToastParams) => string;
    dismissToast: (toastId: string) => void;
};

const [InnerToastProvider, useToastContext] =
    createSafeContext<ToastContextValue>('No ToastProvider found in the tree.');

export { useToastContext };

export function ToastProvider({ children }: PropsWithChildren) {
    const toastCounterRef = useRef(0);
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((toastId: string) => {
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== toastId)
        );
    }, []);

    const dismissToast = useCallback(
        (toastId: string) => {
            let shouldScheduleRemoval = false;

            setToasts((currentToasts) =>
                currentToasts.map((toast) => {
                    if (toast.id !== toastId || toast.isClosing) {
                        return toast;
                    }

                    shouldScheduleRemoval = true;

                    return {
                        ...toast,
                        isClosing: true,
                    };
                })
            );

            if (shouldScheduleRemoval && typeof window !== 'undefined') {
                window.setTimeout(
                    () => removeToast(toastId),
                    TOAST_EXIT_DURATION_MS
                );
            }
        },
        [removeToast]
    );

    const displayToast = useCallback(
        ({
            type,
            text,
            duration = DEFAULT_TOAST_DURATION_MS,
            closable = false,
        }: DisplayToastParams) => {
            const toastId = `toast-${toastCounterRef.current++}`;

            setToasts((currentToasts) => [
                ...currentToasts,
                {
                    id: toastId,
                    type,
                    text,
                    duration,
                    closable,
                    isClosing: false,
                },
            ]);

            if (duration > 0 && typeof window !== 'undefined') {
                window.setTimeout(() => dismissToast(toastId), duration);
            }

            return toastId;
        },
        [dismissToast]
    );

    const contextValue = useMemo(
        () =>
            ({
                toasts,
                displayToast,
                dismissToast,
            }) satisfies ToastContextValue,
        [dismissToast, displayToast, toasts]
    );

    return (
        <InnerToastProvider value={contextValue}>{children}</InnerToastProvider>
    );
}

export { TOAST_EXIT_DURATION_MS };
