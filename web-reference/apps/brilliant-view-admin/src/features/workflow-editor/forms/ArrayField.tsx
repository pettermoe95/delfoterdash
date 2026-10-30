import type { z } from 'zod';
import { CloseIcon } from '../components/CloseIcon';
import { useSortableList } from '../components/useSortableList';
import { reorderListItem } from '../model/listOrder';
import type { CollectionFieldProps } from './collectionTypes';
import { initialValue, isScalarSchema } from './schema';

type ArrayFieldProps = Omit<CollectionFieldProps, 'schema'> & {
    schema: z.ZodArray<z.ZodTypeAny>;
};
export function ArrayField({
    schema,
    value,
    onChange,
    render,
    ordered = false,
}: ArrayFieldProps) {
    const items: unknown[] = Array.isArray(value) ? value : [];
    const compact = isScalarSchema(schema.element);
    const sortable = useSortableList(items.length, (from, to) =>
        onChange(reorderListItem(items, from, to))
    );
    const changeItem = (index: number, next: unknown) =>
        onChange(items.map((item, i) => (i === index ? next : item)));
    const removeItem = (index: number) =>
        onChange(items.filter((_, i) => i !== index));
    const addItem = () => onChange([...items, initialValue(schema.element)]);
    const renderItem = (item: unknown, index: number) => (
        <div
            {...(ordered ? sortable.itemProps(index) : {})}
            className={
                compact ? 'we-list-item we-list-item-compact' : 'we-list-item'
            }
            key={index}
        >
            {ordered && sortable.handle(index, `item ${index + 1}`)}
            <div className="we-list-actions">
                <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    title={`Remove item ${index + 1}`}
                    onClick={() => removeItem(index)}
                >
                    <CloseIcon />
                </button>
            </div>
            {render(schema.element, item, String(index), (next) =>
                changeItem(index, next)
            )}
        </div>
    );
    return (
        <div className="we-collection">
            {items.map(renderItem)}
            <button type="button" onClick={addItem}>
                + Add item
            </button>
        </div>
    );
}
