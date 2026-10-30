import { describe, expect, it } from 'vitest';
import {
    conditionPredicate,
    defaultBetweenBounds,
    formatPredicate,
    predicateFormState,
    referencedRelations,
    validateCondition,
} from './relationshipPredicate';
import type { EditableCondition } from './relationshipPredicate';
import type { Predicate } from './semanticModel';

const defaults: EditableCondition = {
    kind: 'editable',
    leftRelation: 'source',
    leftColumn: 'event_date',
    rightKind: 'column',
    rightValue: 'id',
    literalType: 'TEXT',
    operator: 'eq',
    values: [''],
    ...defaultBetweenBounds(['id', '__bv__valid_from', '__bv__valid_to']),
};
const between: Predicate = {
    type: 'between',
    operand: { relation: 'events', column: 'event_date' },
    lower: { relation: 'customers', column: 'start_date' },
    upper: { relation: 'customers', column: 'end_date' },
};

describe('BETWEEN predicates', () => {
    it.each([
        [
            ['id', '__bv__valid_from', '__bv__valid_to'],
            '__bv__valid_from',
            '__bv__valid_to',
        ],
        [['__bv__valid_from'], '__bv__valid_from', ''],
        [['__bv__valid_to'], '', '__bv__valid_to'],
        [['id'], '', ''],
    ])(
        'defaults only existing validity columns in %j',
        (columns, lower, upper) => {
            expect(defaultBetweenBounds(columns)).toEqual({
                lowerColumn: lower,
                upperColumn: upper,
            });
        }
    );

    it('round-trips saved custom bounds in a NOT/AND group alongside equality', () => {
        const predicate: Predicate = {
            type: 'not',
            predicate: {
                type: 'and',
                predicates: [
                    conditionPredicate(defaults, 'events', 'customers'),
                    between,
                ],
            },
        };
        const form = predicateFormState(
            predicate,
            defaults,
            'events',
            'customers'
        );
        expect(form.negate).toBe(true);
        expect(form.logic).toBe('and');
        expect(form.conditions[1]).toMatchObject({
            kind: 'editable',
            operator: 'between',
            lowerColumn: 'start_date',
            upperColumn: 'end_date',
        });
        expect(
            form.conditions.map((condition) =>
                conditionPredicate(condition, 'events', 'customers')
            )
        ).toEqual(
            predicate.predicate.type === 'and'
                ? predicate.predicate.predicates
                : []
        );
    });

    it('formats ranges and includes their relations in join validation', () => {
        expect(
            referencedRelations({ type: 'not', predicate: between })
        ).toEqual(['events', 'customers', 'customers']);
        expect(formatPredicate(between)).toContain(
            'events.event_date BETWEEN customers.start_date AND customers.end_date'
        );
    });

    it('preserves reverse-direction ranges', () => {
        const reverse: Predicate = {
            ...between,
            operand: { relation: 'customers', column: 'event_date' },
            lower: { relation: 'events', column: 'start_date' },
            upper: { relation: 'events', column: 'end_date' },
        };
        const form = predicateFormState(
            reverse,
            defaults,
            'events',
            'customers'
        );
        expect(form.conditions[0].kind).toBe('preserved');
        expect(
            conditionPredicate(form.conditions[0], 'events', 'customers')
        ).toEqual(reverse);
    });

    it('identifies each missing bound without unrelated literal errors', () => {
        const condition = { ...defaults, operator: 'between' as const };
        expect(
            validateCondition(
                condition,
                ['event_date'],
                ['__bv__valid_from', '__bv__valid_to']
            )
        ).toEqual({});
        expect(
            validateCondition(condition, ['event_date'], ['__bv__valid_from'])
        ).toEqual({ upperColumn: 'Select an upper-bound column.' });
        expect(
            validateCondition(condition, ['event_date'], ['__bv__valid_to'])
        ).toEqual({ lowerColumn: 'Select a lower-bound column.' });
    });
});
