import type { LiteralOperand, Operand, Predicate } from './semanticModel';

export const operators = [
    ['eq', '='],
    ['neq', '≠'],
    ['lt', '<'],
    ['lte', '≤'],
    ['gt', '>'],
    ['gte', '≥'],
    ['between', 'BETWEEN'],
    ['in', 'IN'],
    ['is_null', 'IS NULL'],
] as const;

export type EditableCondition = {
    kind: 'editable';
    leftRelation: 'source' | 'target';
    leftColumn: string;
    rightKind: 'column' | 'literal';
    rightValue: string;
    literalType: LiteralOperand['literal_type'];
    operator: (typeof operators)[number][0];
    values: string[];
    lowerColumn: string;
    upperColumn: string;
};

export type Condition =
    | EditableCondition
    | { kind: 'preserved'; predicate: Predicate };

export function defaultBetweenBounds(targetColumns: string[]) {
    return {
        lowerColumn: targetColumns.includes('__bv__valid_from')
            ? '__bv__valid_from'
            : '',
        upperColumn: targetColumns.includes('__bv__valid_to')
            ? '__bv__valid_to'
            : '',
    };
}

export function predicateFormState(
    predicate: Predicate | undefined,
    defaultCondition: EditableCondition,
    source: string,
    target: string
) {
    const negate = predicate?.type === 'not';
    const current = predicate?.type === 'not' ? predicate.predicate : predicate;
    const logic: 'and' | 'or' = current?.type === 'or' ? 'or' : 'and';
    const predicates =
        current?.type === 'and' || current?.type === 'or'
            ? current.predicates
            : current
              ? [current]
              : [];
    const conditions: Condition[] = predicates.map((item) => {
        if (item.type === 'between') {
            if (
                item.operand.relation !== source ||
                item.lower.relation !== target ||
                item.upper.relation !== target
            )
                return { kind: 'preserved', predicate: item };
            return {
                ...defaultCondition,
                operator: 'between',
                leftRelation: 'source',
                leftColumn: item.operand.column,
                lowerColumn: item.lower.column,
                upperColumn: item.upper.column,
            };
        }
        const operand =
            item.type === 'in' || item.type === 'is_null'
                ? item.operand
                : 'left' in item
                  ? item.left
                  : undefined;
        if (
            !operand ||
            !('column' in operand) ||
            ![source, target].includes(operand.relation) ||
            ('right' in item &&
                'column' in item.right &&
                item.right.relation !== target) ||
            (item.type === 'in' &&
                item.values.some(
                    (literal) =>
                        literal.literal_type !== item.values[0]?.literal_type
                ))
        ) {
            return { kind: 'preserved', predicate: item };
        }
        const condition: EditableCondition = {
            ...defaultCondition,
            leftRelation: operand.relation === target ? 'target' : 'source',
            leftColumn: operand.column,
        };
        if (item.type === 'in')
            return {
                ...condition,
                operator: 'in',
                literalType: item.values[0]?.literal_type ?? 'TEXT',
                values: item.values.map((literal) => literal.value),
            };
        if (item.type === 'is_null')
            return { ...condition, operator: 'is_null' };
        if ('right' in item) {
            return {
                ...condition,
                operator: item.type,
                rightKind: 'column' in item.right ? 'column' : 'literal',
                rightValue:
                    'column' in item.right
                        ? item.right.column
                        : item.right.value,
                literalType:
                    'literal_type' in item.right
                        ? item.right.literal_type
                        : 'TEXT',
            };
        }
        return { kind: 'preserved', predicate: item };
    });
    return {
        conditions: conditions.length ? conditions : [defaultCondition],
        logic,
        negate,
    };
}

export function conditionPredicate(
    condition: Condition,
    source: string,
    target: string
): Predicate {
    if (condition.kind === 'preserved') return condition.predicate;
    const left = {
        relation: condition.leftRelation === 'source' ? source : target,
        column: condition.leftColumn,
    };
    if (condition.operator === 'between')
        return {
            type: 'between',
            operand: left,
            lower: { relation: target, column: condition.lowerColumn },
            upper: { relation: target, column: condition.upperColumn },
        };
    if (condition.operator === 'in')
        return {
            type: 'in',
            operand: left,
            values: condition.values.map((value) => ({
                value,
                literal_type: condition.literalType,
            })),
        };
    if (condition.operator === 'is_null')
        return { type: 'is_null', operand: left };
    return {
        type: condition.operator,
        left,
        right:
            condition.rightKind === 'column'
                ? { relation: target, column: condition.rightValue }
                : {
                      value: condition.rightValue,
                      literal_type: condition.literalType,
                  },
    };
}

export function validLiteral(literal: LiteralOperand) {
    const value = literal.value;
    if (!value && literal.literal_type !== 'TEXT') return false;
    switch (literal.literal_type) {
        case 'TEXT':
            return true;
        case 'NUMBER':
            return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(value);
        case 'BOOLEAN':
            return value === 'true' || value === 'false';
        case 'DATE': {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
            const date = new Date(`${value}T00:00:00Z`);
            return (
                !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value
            );
        }
    }
}

export type ConditionErrors = Partial<
    Record<
        'leftColumn' | 'lowerColumn' | 'upperColumn' | 'rightValue' | 'values',
        string
    >
>;

export function validateCondition(
    condition: Condition,
    sourceColumns: string[],
    targetColumns: string[]
): ConditionErrors {
    if (condition.kind === 'preserved') return {};
    const errors: ConditionErrors = {};
    const leftColumns =
        condition.leftRelation === 'source' ? sourceColumns : targetColumns;
    if (!leftColumns.includes(condition.leftColumn))
        errors.leftColumn = 'Select a valid column.';
    if (condition.operator === 'between') {
        if (condition.leftRelation !== 'source')
            errors.leftColumn = 'Select a source column for BETWEEN.';
        if (!targetColumns.includes(condition.lowerColumn))
            errors.lowerColumn = 'Select a lower-bound column.';
        if (!targetColumns.includes(condition.upperColumn))
            errors.upperColumn = 'Select an upper-bound column.';
    } else if (condition.operator === 'in') {
        if (!condition.values.length)
            errors.values = 'IN requires at least one value.';
        else if (
            !condition.values.every((value) =>
                validLiteral({ value, literal_type: condition.literalType })
            )
        )
            errors.values = literalValidationMessage(condition.literalType);
    } else if (condition.operator !== 'is_null') {
        if (condition.rightKind === 'column') {
            if (!targetColumns.includes(condition.rightValue))
                errors.rightValue = 'Select a valid target column.';
        } else if (
            !validLiteral({
                value: condition.rightValue,
                literal_type: condition.literalType,
            })
        )
            errors.rightValue = literalValidationMessage(condition.literalType);
    }
    return errors;
}

function literalValidationMessage(type: LiteralOperand['literal_type']) {
    switch (type) {
        case 'BOOLEAN':
            return 'Enter true or false.';
        case 'DATE':
            return 'Enter a valid date in YYYY-MM-DD format.';
        case 'NUMBER':
            return 'Enter a valid number.';
        case 'TEXT':
            return 'Enter a valid text value.';
    }
}

export function referencedRelations(predicate: Predicate): string[] {
    const operandRelations = (operand: Operand) =>
        'relation' in operand ? [operand.relation] : [];
    switch (predicate.type) {
        case 'and':
        case 'or':
            return predicate.predicates.flatMap(referencedRelations);
        case 'not':
            return referencedRelations(predicate.predicate);
        case 'between':
            return [
                predicate.operand.relation,
                predicate.lower.relation,
                predicate.upper.relation,
            ];
        case 'in':
        case 'is_null':
            return operandRelations(predicate.operand);
        default:
            return [
                ...operandRelations(predicate.left),
                ...operandRelations(predicate.right),
            ];
    }
}

export function formatPredicate(predicate: Predicate): string {
    const operand = (value: Operand) =>
        'column' in value
            ? `${value.relation}.${value.column}`
            : JSON.stringify(value.value);
    switch (predicate.type) {
        case 'and':
        case 'or':
            return `(${predicate.predicates.map(formatPredicate).join(` ${predicate.type.toUpperCase()} `)})`;
        case 'not':
            return `NOT (${formatPredicate(predicate.predicate)})`;
        case 'between':
            return `${operand(predicate.operand)} BETWEEN ${operand(predicate.lower)} AND ${operand(predicate.upper)} (NULL upper bound is open-ended)`;
        case 'in':
            return `${operand(predicate.operand)} IN (${predicate.values.map(operand).join(', ')})`;
        case 'is_null':
            return `${operand(predicate.operand)} IS NULL`;
        default:
            return `${operand(predicate.left)} ${operators.find(([operator]) => operator === predicate.type)?.[1]} ${operand(predicate.right)}`;
    }
}
