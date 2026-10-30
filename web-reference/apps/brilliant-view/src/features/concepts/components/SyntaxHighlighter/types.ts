export type SyntaxKeywords = {
    functions: Record<string, string>;
    tables: Record<string, Record<string, string>>;
    metric_concepts: Record<string, string>;
    field_concepts: Record<string, string>;
};

export type KeywordColors = {
    functions: string;
    tables: string;
    columns: string;
    metric_concepts: string;
    field_concepts: string;
    numbers: string;
    strings: string;
    error: string;
};

export type SuggestionType =
    | 'table'
    | 'column'
    | 'function'
    | 'metric_concept'
    | 'field_concept';

export type Suggestion = {
    label: string;
    insertText: string;
    type: SuggestionType;
    detail?: string;
};

export type SuggestionPosition = { left: number; top: number } | null;

export type ReplaceRange = { start: number; end: number };
