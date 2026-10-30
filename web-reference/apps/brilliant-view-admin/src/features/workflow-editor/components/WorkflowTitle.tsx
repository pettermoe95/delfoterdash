import { mdiPencilOutline } from '@mdi/js';
import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ButtonIcon } from './ButtonIcon';

type WorkflowTitleProps = {
    name: string;
    disabled: boolean;
    onChange: (name: string) => void;
    onFinish: () => void;
};

export function WorkflowTitle({
    name,
    disabled,
    onChange,
    onFinish,
}: WorkflowTitleProps) {
    const [editing, setEditing] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const button = useRef<HTMLButtonElement>(null);
    const original = useRef(name);
    const restoreFocus = useRef(false);
    useEffect(() => {
        if (editing) {
            input.current?.focus();
            input.current?.select();
        } else if (restoreFocus.current) {
            button.current?.focus();
            restoreFocus.current = false;
        }
    }, [editing]);
    const finishEditing = () => {
        setEditing(false);
        onFinish();
    };
    const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            if (event.key === 'Escape') onChange(original.current);
            restoreFocus.current = true;
            finishEditing();
        }
    };
    return (
        <div className="we-title">
            <small>
                Workflow Editor <span>V2</span>
            </small>
            <h1 title={name} aria-label={name || 'Untitled workflow'}>
                {editing ? (
                    <input
                        ref={input}
                        aria-label="Workflow title"
                        value={name}
                        disabled={disabled}
                        onChange={(event) => onChange(event.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={handleTitleKeyDown}
                    />
                ) : (
                    <button
                        ref={button}
                        type="button"
                        className="we-workflow-name"
                        disabled={disabled}
                        aria-label="Edit workflow name"
                        title="Click to rename workflow"
                        onClick={() => {
                            original.current = name;
                            setEditing(true);
                        }}
                    >
                        <span>{name || 'Untitled workflow'}</span>
                        <ButtonIcon path={mdiPencilOutline} />
                    </button>
                )}
            </h1>
        </div>
    );
}
