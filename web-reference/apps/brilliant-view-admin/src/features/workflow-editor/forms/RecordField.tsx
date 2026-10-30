import { useState } from 'react';
import type { z } from 'zod';
import { CloseIcon } from '../components/CloseIcon';
import type { CollectionFieldProps } from './collectionTypes';
import { initialValue, isRecord, isScalarSchema } from './schema';

type RecordFieldProps = Omit<CollectionFieldProps, 'schema'> & {
    schema: z.ZodRecord;
};
export function RecordField({
    schema,
    value,
    onChange,
    render,
}: RecordFieldProps) {
    const [newKey, setNewKey] = useState('');
    const [error, setError] = useState('');
    const entries = isRecord(value) ? value : {};
    const compact = isScalarSchema(schema.valueSchema);
    const removeEntry = (key: string) => {
        const next = { ...entries };
        delete next[key];
        onChange(next);
    };
    const addEntry = () => {
        const key = newKey.trim();
        if (
            !key ||
            Object.hasOwn(entries, key) ||
            ['__proto__', 'prototype', 'constructor'].includes(key)
        ) {
            setError('Choose a unique, nonempty key.');
            return;
        }
        onChange({ ...entries, [key]: initialValue(schema.valueSchema) });
        setNewKey('');
        setError('');
    };
    const renderEntry = ([key, entry]: [string, unknown]) => (
        <div
            className={
                compact
                    ? 'we-list-item we-record-item we-list-item-compact'
                    : 'we-list-item we-record-item'
            }
            key={key}
        >
            <strong
                className="we-record-key"
                title={key}
                aria-hidden={compact || undefined}
            >
                {key}
            </strong>
            <div className="we-list-actions">
                <button
                    type="button"
                    aria-label={`Remove ${key}`}
                    title={`Remove ${key}`}
                    onClick={() => removeEntry(key)}
                >
                    <CloseIcon />
                </button>
            </div>
            {render(schema.valueSchema, entry, key, (next) =>
                onChange({ ...entries, [key]: next })
            )}
        </div>
    );
    return (
        <div className="we-collection">
            {Object.entries(entries).map(renderEntry)}
            <div className="we-row">
                <input
                    aria-label="New key"
                    placeholder="New key"
                    value={newKey}
                    onChange={(event) => setNewKey(event.target.value)}
                />
                <button type="button" onClick={addEntry}>
                    Add
                </button>
            </div>
            {error && (
                <p role="alert" className="we-error">
                    {error}
                </p>
            )}
        </div>
    );
}
