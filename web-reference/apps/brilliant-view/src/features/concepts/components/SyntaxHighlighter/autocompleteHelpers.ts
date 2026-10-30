import type { ReplaceRange, Suggestion, SyntaxKeywords } from './types';

export const WORD_PART_REGEX = /[a-zA-Z0-9_.]/;

export const getWordAtCaret = (text: string, caret: number) => {
    let start = caret;
    while (start > 0 && WORD_PART_REGEX.test(text[start - 1])) start--;
    let end = caret;
    while (end < text.length && WORD_PART_REGEX.test(text[end])) end++;
    return { word: text.slice(start, end), start, end };
};

export const rankMatch = (label: string, query: string) => {
    const labelLowerCase = label.toLowerCase();
    const index = labelLowerCase.indexOf(query.toLowerCase());
    if (index === -1) return null;
    return { isPrefix: index === 0, index };
};

type BuildSuggestionsArgs = {
    text: string;
    caret: number;
    keywords: SyntaxKeywords;
};

export type BuildSuggestionsResult = {
    suggestions: Suggestion[];
    replaceRange: ReplaceRange | null;
};

export const buildSuggestions = ({
    text,
    caret,
    keywords,
}: BuildSuggestionsArgs): BuildSuggestionsResult => {
    let inString: string | null = null;
    for (let i = 0; i < caret; i++) {
        const char = text[i];
        if (char === '\\') {
            i += 1;
            continue;
        }
        if (char === '"' || char === "'") {
            if (inString === char) {
                inString = null;
            } else if (!inString) {
                inString = char;
            }
        }
    }

    if (inString) {
        return { suggestions: [], replaceRange: null };
    }

    const { word, start, end } = getWordAtCaret(text, caret);

    if (!word) {
        return { suggestions: [], replaceRange: null };
    }

    // table context
    const dotIndex = word.indexOf('.');
    if (dotIndex > 0) {
        const tableName = word.slice(0, dotIndex);
        const table = keywords.tables[tableName];
        if (!table) {
            return { suggestions: [], replaceRange: null };
        }

        const columnPrefix = word.slice(dotIndex + 1);
        const columnNames = Object.keys(table);

        const sortedColumns =
            columnPrefix.length === 0
                ? columnNames.sort((a, b) => a.localeCompare(b))
                : columnNames
                      .map((name) => ({
                          name,
                          rank: rankMatch(name, columnPrefix),
                      }))
                      .filter((entry) => entry.rank !== null)
                      .sort((a, b) => {
                          if (a.rank!.isPrefix !== b.rank!.isPrefix) {
                              return a.rank!.isPrefix ? -1 : 1;
                          }
                          if (a.rank!.index !== b.rank!.index) {
                              return a.rank!.index - b.rank!.index;
                          }
                          return a.name.localeCompare(b.name);
                      })
                      .map((entry) => entry.name);

        const suggestions: Suggestion[] = sortedColumns.map((column) => ({
            label: column,
            insertText: column,
            type: 'column',
            detail: table[column],
        }));

        return {
            suggestions,
            // only replace the part after the dot
            replaceRange: {
                start: start + dotIndex + 1,
                end,
            },
        };
    }

    // global context
    const query = word;
    if (!query) {
        return { suggestions: [], replaceRange: null };
    }

    const candidates: Suggestion[] = [
        ...Object.keys(keywords.tables).map((label) => ({
            label,
            insertText: label,
            type: 'table' as const,
        })),
        ...Object.keys(keywords.functions).map((label) => ({
            label,
            insertText: label,
            type: 'function' as const,
        })),
        ...Object.keys(keywords.metric_concepts).map((label) => ({
            label,
            insertText: label,
            type: 'metric_concept' as const,
        })),
        ...Object.keys(keywords.field_concepts).map((label) => ({
            label,
            insertText: label,
            type: 'field_concept' as const,
        })),
    ];

    const filtered = candidates
        .map((candidate) => ({
            ...candidate,
            rank: rankMatch(candidate.label, query),
        }))
        .filter((candidate) => candidate.rank !== null)
        .sort((a, b) => {
            if (a.rank!.isPrefix !== b.rank!.isPrefix) {
                return a.rank!.isPrefix ? -1 : 1;
            }
            if (a.rank!.index !== b.rank!.index) {
                return a.rank!.index - b.rank!.index;
            }
            return a.label.localeCompare(b.label);
        })
        .map(({ rank: _rank, ...candidate }) => candidate);

    return {
        suggestions: filtered,
        replaceRange: { start, end },
    };
};
