import { useDatabaseIntrospection } from '~/features/introspection/hooks/useDatabaseIntrospection';
import { useFieldConcepts, useMetricConcepts } from '~/hooks';
import type { SyntaxKeywords } from './types';

const CONCEPT_EXPRESSION_FUNCTIONS = {
    SUM: 'Sums up all values.',
    AVG: 'Averages all values.',
    COUNT: 'Count the number of values.',
    MIN: 'The minimum value.',
    MAX: 'The maximum value.',
    LN: 'Logarithm of the value.',
    EXP: 'Exponential of the value.',
    ACCUMULATE: 'Accumulates all values.',
    ACCUMULATE_DELTA: 'Accumulates all values and returns the delta.',
    COALESCE: 'Returns the first non-null value.',
    CONCAT: 'Concatenates all parameters passed in.',
};

export default function useHighlighterKeywords(): SyntaxKeywords {
    const { data: metricConcepts } = useMetricConcepts(true);
    const { data: fieldConcepts } = useFieldConcepts(true);
    const { data: tableData } = useDatabaseIntrospection();
    const metric_concepts: Record<string, string> = Object.fromEntries(
        metricConcepts
            ? metricConcepts.map((concept) => [
                  concept.concept_name,
                  concept.expression,
              ])
            : []
    );
    const field_concepts: Record<string, string> = Object.fromEntries(
        fieldConcepts
            ? fieldConcepts.map((concept) => [
                  concept.concept_name,
                  concept.expression,
              ])
            : []
    );
    const tables: Record<string, Record<string, string>> = {};

    if (tableData) {
        tableData.forEach((table) => {
            tables[table.name] = Object.fromEntries(
                table.columns.map((column) => [column.name, column.data_type])
            );
        });
    }

    return {
        functions: CONCEPT_EXPRESSION_FUNCTIONS,
        tables,
        metric_concepts,
        field_concepts,
    };
}
