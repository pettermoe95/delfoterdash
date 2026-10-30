import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../components/CloseIcon';

type NodeNameProps = {
    id: string;
    disabled: boolean;
    onRename: (name: string) => string | undefined;
};

export function NodeName({ id, disabled, onRename }: NodeNameProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(id);
    const [error, setError] = useState('');
    const input = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (editing) {
            input.current?.focus();
            input.current?.select();
        }
    }, [editing]);
    const startEditing = () => {
        if (disabled) return;
        setDraft(id);
        setError('');
        setEditing(true);
    };

    const handleNameKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (['Enter', ' ', 'F2'].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            startEditing();
        }
    };
    if (!editing)
        return (
            <button
                type="button"
                className="we-node-name"
                disabled={disabled}
                aria-label={`Rename worker ${id}`}
                title={`${id} — double-click to rename`}
                onDoubleClickCapture={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    startEditing();
                }}
                onKeyDown={handleNameKeyDown}
            >
                <strong>{id}</strong>
                <span aria-hidden="true">✎</span>
            </button>
        );

    const confirmRename = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const message = onRename(draft);
        if (message) setError(message);
        else setEditing(false);
    };
    const handleRenameKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setEditing(false);
        }
        if (event.key === 'Enter') event.stopPropagation();
    };
    return (
        <form
            className="we-node-rename nodrag nopan"
            onPointerDown={(event) => event.stopPropagation()}
            onSubmit={confirmRename}
            onKeyDown={handleRenameKeyDown}
        >
            <input
                ref={input}
                aria-label="Worker ID"
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-rename-error` : undefined}
                value={draft}
                disabled={disabled}
                onChange={(event) => {
                    setDraft(event.target.value);
                    setError('');
                }}
            />
            <div className="we-node-rename-actions">
                <button
                    type="submit"
                    disabled={disabled}
                    aria-label="Confirm worker rename"
                    title="Confirm rename (Enter)"
                >
                    ✓
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    aria-label="Cancel worker rename"
                    title="Cancel rename (Escape)"
                    onClick={() => setEditing(false)}
                >
                    <CloseIcon />
                </button>
            </div>
            {error && (
                <div
                    id={`${id}-rename-error`}
                    className="we-node-rename-error we-error"
                    role="alert"
                >
                    {error}
                </div>
            )}
        </form>
    );
}
