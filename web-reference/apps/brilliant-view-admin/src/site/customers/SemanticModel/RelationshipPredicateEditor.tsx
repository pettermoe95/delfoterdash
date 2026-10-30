import { Button, Checkbox, SingleSelect } from '@brilliant/bds-core';
import type { ComponentProps } from 'react';
import { RelationshipConditionRow } from './RelationshipConditionRow';
import type { useRelationshipPredicate } from './useRelationshipPredicate';

type RelationshipPredicateEditorProps = {
    source: string;
    target: string;
    sourceColumns: string[];
    targetColumns: string[];
    form: ReturnType<typeof useRelationshipPredicate>;
};

export function RelationshipPredicateEditor({
    source,
    target,
    sourceColumns,
    targetColumns,
    form,
}: RelationshipPredicateEditorProps) {
    const logicOptions = [
        { value: 'and', label: 'All conditions (AND)' },
        { value: 'or', label: 'Any condition (OR)' },
    ];

    const handleLogicChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) => form.changeLogic(value as 'and' | 'or');

    const handleNegateChange: NonNullable<
        ComponentProps<typeof Checkbox>['onCheckedChange']
    > = (checked) => form.changeNegate(!!checked);

    return (
        <fieldset>
            <legend className="mb-1 text-sm font-medium">Join predicate</legend>
            {form.conditions.map((condition, index) => (
                <RelationshipConditionRow
                    key={index}
                    source={source}
                    target={target}
                    sourceColumns={sourceColumns}
                    targetColumns={targetColumns}
                    condition={condition}
                    errors={form.conditionErrors[index]}
                    index={index}
                    onChange={(value) => form.updateCondition(index, value)}
                    onRemove={
                        form.conditions.length > 1
                            ? () => form.removeCondition(index)
                            : undefined
                    }
                />
            ))}
            {form.validationError && (
                <p role="alert" className="mb-2 text-sm text-error-primary">
                    {form.validationError}
                </p>
            )}
            <div className="flex gap-2">
                <Button size="sm" type="button" onClick={form.addCondition}>
                    Add condition
                </Button>
                {form.conditions.length > 1 && (
                    <div className="flex gap-2">
                        <SingleSelect
                            options={logicOptions}
                            onChange={handleLogicChange}
                            value={form.logic}
                        />
                    </div>
                )}
                <label className="flex items-center gap-1 text-sm">
                    <Checkbox
                        checked={form.negate}
                        onCheckedChange={handleNegateChange}
                    />{' '}
                    Negate (NOT)
                </label>
            </div>
        </fieldset>
    );
}
