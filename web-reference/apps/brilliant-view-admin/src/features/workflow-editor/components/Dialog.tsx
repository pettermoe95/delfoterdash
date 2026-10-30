import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CloseIcon } from './CloseIcon';

type DialogProps = {
    title: string;
    onClose: () => void;
    children: ReactNode;
    className?: string;
};
export function Dialog({
    title,
    onClose,
    children,
    className = '',
}: DialogProps) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        ref.current?.showModal();
    }, []);
    return (
        <dialog
            ref={ref}
            className={`we-dialog ${className}`}
            aria-label={title}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            <div className="we-row">
                <h2>{title}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={`Close ${title}`}
                >
                    <CloseIcon />
                </button>
            </div>
            {children}
        </dialog>
    );
}
