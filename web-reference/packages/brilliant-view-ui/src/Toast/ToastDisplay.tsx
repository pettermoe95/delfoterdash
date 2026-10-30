import { cn } from '../utils/styles';
import type { ToastPosition } from './Toast';
import { Toast } from './Toast';
import { TOAST_EXIT_DURATION_MS, useToastContext } from './ToastContext';

type ToastDisplayProps = {
    position?: ToastPosition;
    className?: string;
};

const POSITION_LAYOUT_STYLES: Record<ToastPosition, string> = {
    'bottom-right': 'bottom-6 right-6 items-end',
    'bottom-left': 'bottom-6 left-6 items-start',
    'top-right': 'top-6 right-6 items-end',
    'top-left': 'top-6 left-6 items-start',
};

export function ToastDisplay({
    position = 'bottom-right',
    className,
}: ToastDisplayProps) {
    const { toasts, dismissToast } = useToastContext();

    return (
        <div
            className={cn(
                'pointer-events-none fixed z-50 flex w-full max-w-sm flex-col gap-3',
                POSITION_LAYOUT_STYLES[position],
                className
            )}
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        'w-full transition-all motion-reduce:transition-none',
                        toast.isClosing
                            ? 'translate-y-2 opacity-0 duration-200'
                            : 'translate-y-0 opacity-100 duration-300'
                    )}
                    style={{
                        transitionDuration: `${TOAST_EXIT_DURATION_MS}ms`,
                    }}
                >
                    <Toast
                        open
                        message={toast.text}
                        variant={toast.type}
                        position={position}
                        autoHideDuration={null}
                        closable={toast.closable}
                        onClose={() => dismissToast(toast.id)}
                        inline
                    />
                </div>
            ))}
        </div>
    );
}
