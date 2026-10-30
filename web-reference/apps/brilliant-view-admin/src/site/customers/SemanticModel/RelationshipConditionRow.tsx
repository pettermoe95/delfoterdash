import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    SingleSelect,
} from '@brilliant/bds-core';
import type { ComponentProps } from 'react';
import { useId } from 'react';
import { RelationshipInValues } from './RelationshipInValues';
import { RelationshipLiteralInput } from './RelationshipLiteralInput';
import { RelationshipOperandControls } from './RelationshipOperandControls';
import type {
    Condition,
    ConditionErrors,
    EditableCondition,
} from './relationshipPredicate';
import { formatPredicate, operators } from './relationshipPredicate';
import { literalTypes } from './semanticModel';

type RelationshipConditionRowProps = {
    source: string;
    target: string;
    sourceColumns: string[];
    targetColumns: string[];
    condition: Condition;
    index: number;
    errors?: ConditionErrors;
    onChange: (value: Partial<EditableCondition>) => void;
    onRemove?: () => void;
};

export function RelationshipConditionRow({
    source,
    target,
    sourceColumns,
    targetColumns,
    condition,
    index,
    errors = {},
    onChange,
    onRemove,
}: RelationshipConditionRowProps) {
    const id = useId();
    if (condition.kind === 'preserved') {
        return (
            <div className="mb-3 space-y-2 rounded-md border border-secondary bg-secondary p-3">
                <p className="break-words text-sm">
                    {formatPredicate(condition.predicate)}
                </p>
                <p className="text-xs text-tertiary">
                    {condition.predicate.type === 'in' &&
                    new Set(
                        condition.predicate.values.map(
                            (literal) => literal.literal_type
                        )
                    ).size > 1
                        ? 'This IN condition has mixed value types and is preserved as saved. Replace it with conditions using a single type to edit it.'
                        : 'This condition is preserved as saved. Editing nested groups or these operands is not supported here.'}
                </p>
                {onRemove && (
                    <Button size="sm" type="button" onClick={onRemove}>
                        Remove condition
                    </Button>
                )}
            </div>
        );
    }
    const comparison =
        condition.operator !== 'in' && condition.operator !== 'is_null';
    const changeOperator = (operator: EditableCondition['operator']) => {
        if (operator === 'between') {
            onChange({
                operator,
                leftRelation: 'source',
                leftColumn:
                    condition.leftRelation === 'source'
                        ? condition.leftColumn
                        : (sourceColumns[0] ?? ''),
            });
            return;
        }
        onChange({
            operator,
            ...(!comparison && operator !== 'in' && operator !== 'is_null'
                ? {
                      rightKind: 'column',
                      leftRelation: 'source',
                      leftColumn: sourceColumns[0] ?? '',
                      rightValue: targetColumns[0] ?? '',
                  }
                : {}),
        });
    };
    const handleLeftColumnChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) => onChange({ leftColumn: value });

    const handleOperatorChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) => changeOperator(value as EditableCondition['operator']);

    const handleLiteralTypeChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) =>
        onChange({
            literalType: value as EditableCondition['literalType'],
        });

    const handleValuesChange: NonNullable<
        ComponentProps<typeof RelationshipInValues>['onChange']
    > = (values) => onChange({ values });

    const handleRightValueChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) => onChange({ rightValue: value });

    const handleLiteralChange: NonNullable<
        ComponentProps<typeof RelationshipLiteralInput>['onChange']
    > = (literal) =>
        onChange({
            rightValue: literal.value,
            literalType: literal.literal_type,
        });

    const columnOptions = (columns: string[]) =>
        condition.operator === 'between'
            ? columns.map((column) => ({
                  value: column,
                  label: (
                      <span className="min-w-0 truncate" title={column}>
                          {column}
                      </span>
                  ),
              }))
            : columns;

    return (
        <div className="mb-3 rounded-md border border-secondary bg-secondary p-3">
            <div
                className={`grid gap-3 [&>*]:min-w-0 ${condition.operator === 'between' ? 'grid-cols-1 items-end min-[480px]:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)_minmax(0,1fr)]' : condition.operator === 'in' ? 'grid-cols-[minmax(0,1fr)_8rem_9rem_minmax(0,1fr)] items-start' : 'grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)] items-end'}`}
            >
                <label className="text-xs font-medium text-secondary">
                    <span className="block truncate">{`${condition.leftRelation === 'source' ? source : target} column`}</span>
                    <SingleSelect
                        error={Boolean(errors.leftColumn)}
                        options={columnOptions(
                            condition.leftRelation === 'source'
                                ? sourceColumns
                                : targetColumns
                        )}
                        value={condition.leftColumn}
                        placeholder="Select column"
                        onChange={handleLeftColumnChange}
                    />
                </label>
                <div className="text-xs font-medium text-secondary">
                    <div className="flex items-center gap-1">
                        <label htmlFor={`${id}-operator`}>Operator</label>
                        {condition.operator === 'between' && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="About BETWEEN bounds"
                                        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-secondary text-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                        ?
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="text-sm"
                                    aria-label="BETWEEN bounds"
                                >
                                    Both bounds are inclusive. A NULL upper
                                    bound means the range has no end.
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                    <SingleSelect
                        id={`${id}-operator`}
                        value={condition.operator}
                        onChange={handleOperatorChange}
                        options={operators.map(([value, label]) => ({
                            label,
                            value,
                        }))}
                    />
                </div>
                {condition.operator === 'in' && (
                    <label className="text-xs font-medium text-secondary">
                        Type
                        <SingleSelect
                            value={condition.literalType}
                            options={[...literalTypes]}
                            onChange={handleLiteralTypeChange}
                        />
                    </label>
                )}
                {condition.operator === 'between' ? (
                    <>
                        <label className="text-xs font-medium text-secondary">
                            <span className="block truncate">{`${target} from`}</span>
                            <SingleSelect
                                options={columnOptions(targetColumns)}
                                error={Boolean(errors.lowerColumn)}
                                value={condition.lowerColumn}
                                placeholder="Select lower bound"
                                onChange={(value) =>
                                    onChange({ lowerColumn: value })
                                }
                            />
                        </label>
                        <label className="text-xs font-medium text-secondary">
                            <span className="block truncate">{`${target} to`}</span>
                            <SingleSelect
                                options={columnOptions(targetColumns)}
                                error={Boolean(errors.upperColumn)}
                                value={condition.upperColumn}
                                placeholder="Select upper bound"
                                onChange={(value) =>
                                    onChange({ upperColumn: value })
                                }
                            />
                        </label>
                    </>
                ) : condition.operator === 'in' ? (
                    <RelationshipInValues
                        index={index}
                        values={condition.values}
                        onChange={handleValuesChange}
                    />
                ) : condition.operator ===
                  'is_null' ? null : condition.rightKind === 'column' ? (
                    <label className="text-xs font-medium text-secondary">
                        {`${target} column`}
                        <SingleSelect
                            options={targetColumns}
                            error={Boolean(errors.rightValue)}
                            value={condition.rightValue}
                            placeholder="Select column"
                            onChange={handleRightValueChange}
                        />
                    </label>
                ) : (
                    <RelationshipLiteralInput
                        name={`literal-${index}`}
                        literal={{
                            value: condition.rightValue,
                            literal_type: condition.literalType,
                        }}
                        onChange={handleLiteralChange}
                    />
                )}
            </div>
            <RelationshipOperandControls
                source={source}
                target={target}
                sourceColumns={sourceColumns}
                targetColumns={targetColumns}
                condition={condition}
                onChange={onChange}
            />
            {onRemove && (
                <Button size="sm" type="button" onClick={onRemove}>
                    Remove condition
                </Button>
            )}
        </div>
    );
}
