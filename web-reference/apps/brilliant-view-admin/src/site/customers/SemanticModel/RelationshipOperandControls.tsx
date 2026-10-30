import type { EditableCondition } from './relationshipPredicate';

type RelationshipOperandControlsProps = {
    source: string;
    target: string;
    sourceColumns: string[];
    targetColumns: string[];
    condition: EditableCondition;
    onChange: (value: Partial<EditableCondition>) => void;
};

export function RelationshipOperandControls({
    source,
    target,
    sourceColumns,
    targetColumns,
    condition,
    onChange,
}: RelationshipOperandControlsProps) {
    const comparison =
        condition.operator !== 'in' && condition.operator !== 'is_null';
    const handleColumnComparison = () => {
        if (condition.rightKind === 'column') return;
        onChange({
            rightKind: 'column',
            leftRelation: 'source',
            leftColumn:
                condition.leftRelation === 'source' &&
                sourceColumns.includes(condition.leftColumn)
                    ? condition.leftColumn
                    : (sourceColumns[0] ?? ''),
            rightValue: targetColumns[0] ?? '',
        });
    };

    const handleLiteralComparison = () => {
        if (condition.rightKind === 'literal') return;
        onChange({
            rightKind: 'literal',
            rightValue: '',
        });
    };

    const handleSourceRole = () => {
        if (condition.leftRelation === 'source') return;
        onChange({
            leftRelation: 'source',
            leftColumn: sourceColumns.includes(condition.leftColumn)
                ? condition.leftColumn
                : (sourceColumns[0] ?? ''),
        });
    };

    const handleTargetRole = () => {
        if (condition.leftRelation === 'target') return;
        onChange({
            leftRelation: 'target',
            leftColumn: targetColumns.includes(condition.leftColumn)
                ? condition.leftColumn
                : (targetColumns[0] ?? ''),
        });
    };

    if (condition.operator === 'between') return null;

    return (
        <div className="mt-2 flex items-center gap-2 text-sm">
            {comparison && (
                <>
                    <span className="font-medium text-secondary">
                        Compare with
                    </span>
                    <button
                        type="button"
                        className={`rounded px-2 py-1 ${condition.rightKind === 'column' ? 'bg-brand-solid-primary text-primary-on-brand' : 'border border-secondary bg-primary text-secondary'}`}
                        onClick={handleColumnComparison}
                    >
                        Target column
                    </button>
                    <button
                        type="button"
                        className={`rounded px-2 py-1 ${condition.rightKind === 'literal' ? 'bg-brand-solid-primary text-primary-on-brand' : 'border border-secondary bg-primary text-secondary'}`}
                        onClick={handleLiteralComparison}
                    >
                        Literal value
                    </button>
                </>
            )}
            {(!comparison || condition.rightKind === 'literal') && (
                <>
                    <span className="ml-2 font-medium text-secondary">
                        Column role
                    </span>
                    <button
                        type="button"
                        className={`rounded px-2 py-1 ${condition.leftRelation === 'source' ? 'bg-brand-solid-primary text-primary-on-brand' : 'border border-secondary bg-primary text-secondary'}`}
                        onClick={handleSourceRole}
                    >
                        {source}
                    </button>
                    <button
                        type="button"
                        className={`rounded px-2 py-1 ${condition.leftRelation === 'target' ? 'bg-brand-solid-primary text-primary-on-brand' : 'border border-secondary bg-primary text-secondary'}`}
                        onClick={handleTargetRole}
                    >
                        {target}
                    </button>
                </>
            )}
        </div>
    );
}
