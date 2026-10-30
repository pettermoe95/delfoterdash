import type { KeywordColors, SyntaxKeywords } from './types';

type TokenType = 'word' | 'string' | 'other';

type Token = { value: string; type: TokenType };

function tokenize(text: string): Token[] {
    const tokens: { value: string; type: TokenType }[] = [];
    let current = '';
    let currentlyInWord = /[a-zA-Z0-9_.]/.test(text[0] || '');

    for (let i = 0; i < text.length; i++) {
        const character = text[i];
        if (character == "'" || character == '"') {
            tokens.push({
                value: current,
                type: currentlyInWord ? 'word' : 'other',
            });
            current = '';

            const quoteCharacter = character;
            let quoteString = '';
            let keepGoing = true;
            for (let j = i + 1; j < text.length && keepGoing; j++) {
                const nextCharacter = text[j];
                if (nextCharacter == quoteCharacter) {
                    i = j;
                    keepGoing = false;
                    tokens.push({
                        value: quoteCharacter + quoteString + quoteCharacter,
                        type: 'string',
                    });
                } else if (nextCharacter == '\\' && j + 1 < text.length) {
                    quoteString += '\\' + text[j + 1];
                    j++;
                } else {
                    quoteString += nextCharacter;
                }
            }
            if (keepGoing) {
                // Ended without ending the string. Just push what we got so far.
                tokens.push({
                    value: quoteCharacter + quoteString,
                    type: 'string',
                });
                i = text.length;
            }
        } else {
            const isCharacterWordPart = /[a-zA-Z0-9_.]/.test(character);

            if (isCharacterWordPart === currentlyInWord && character != '\n') {
                current += character;
            } else {
                tokens.push({
                    value: current,
                    type: currentlyInWord ? 'word' : 'other',
                });
                current = character;
                currentlyInWord = isCharacterWordPart;
            }
        }
    }

    if (current)
        tokens.push({
            value: current,
            type: currentlyInWord ? 'word' : 'other',
        });
    return tokens;
}

type HighlightedWordProps = {
    word: string;
    color: string;
    tooltip?: { title: string; content: string };
};

function HighlightedWord({ word, color, tooltip }: HighlightedWordProps) {
    return (
        <span
            style={{ color: color, fontWeight: 'bold' }}
            tooltip-title={tooltip?.title}
            tooltip-description={tooltip?.content}
        >
            {word}
        </span>
    );
}

type HighlightedTextProps = {
    input: string;
    keywords: SyntaxKeywords;
    colors: KeywordColors;
};

export function HighlightedText({
    input,
    keywords,
    colors,
}: HighlightedTextProps) {
    const tokens = tokenize(input);

    return (
        <>
            {tokens.map((token, index) => {
                const tokenKey = `${index}-${token.type}-${token.value}`;

                if (token.value === '\n') return <br key={tokenKey} />;
                if (token.type === 'other')
                    return <span key={tokenKey}>{token.value}</span>;
                if (token.type === 'string')
                    return (
                        <HighlightedWord
                            key={tokenKey}
                            color={colors.strings}
                            word={token.value}
                        />
                    );

                if (!isNaN(Number(token.value))) {
                    return (
                        <HighlightedWord
                            key={tokenKey}
                            color={colors.numbers}
                            word={token.value}
                        />
                    );
                }

                if (
                    Object.hasOwn(keywords.functions, token.value.toUpperCase())
                ) {
                    return (
                        <HighlightedWord
                            key={tokenKey}
                            color={colors.functions}
                            word={token.value}
                            tooltip={{
                                title: 'Function: ' + token.value + '()',
                                content:
                                    keywords.functions[
                                        token.value.toUpperCase()
                                    ],
                            }}
                        />
                    );
                }
                if (Object.hasOwn(keywords.metric_concepts, token.value)) {
                    return (
                        <HighlightedWord
                            key={tokenKey}
                            color={colors.metric_concepts}
                            word={token.value}
                            tooltip={{
                                title: 'Metric concept: ' + token.value,
                                content: keywords.metric_concepts[token.value],
                            }}
                        />
                    );
                }
                if (Object.hasOwn(keywords.field_concepts, token.value)) {
                    return (
                        <HighlightedWord
                            key={tokenKey}
                            color={colors.field_concepts}
                            word={token.value}
                            tooltip={{
                                title: 'Field concept: ' + token.value,
                                content: keywords.field_concepts[token.value],
                            }}
                        />
                    );
                }

                const dotIndex = token.value.indexOf('.');
                if (dotIndex > 0) {
                    const table = token.value.substring(0, dotIndex);
                    const column = token.value.substring(dotIndex + 1);
                    if (keywords.tables[table]) {
                        const tableTooltip =
                            'Columns:\n' +
                            Object.keys(keywords.tables[table])
                                .map(
                                    (column) =>
                                        ' - ' +
                                        column +
                                        ' (' +
                                        keywords.tables[table][column] +
                                        ')'
                                )
                                .join('\n');
                        if (keywords.tables[table][column]) {
                            return (
                                <span key={tokenKey}>
                                    <HighlightedWord
                                        color={colors.tables}
                                        word={table}
                                        tooltip={{
                                            title: 'Table: ' + table,
                                            content: tableTooltip,
                                        }}
                                    />
                                    .
                                    <HighlightedWord
                                        color={colors.columns}
                                        word={column}
                                        tooltip={{
                                            title:
                                                'Column: ' +
                                                table +
                                                '.' +
                                                column,
                                            content:
                                                'Data type: ' +
                                                keywords.tables[table][column],
                                        }}
                                    />
                                </span>
                            );
                        } else {
                            return (
                                <span key={tokenKey}>
                                    <HighlightedWord
                                        color={colors.tables}
                                        word={table}
                                        tooltip={{
                                            title: 'Table: ' + table,
                                            content: tableTooltip,
                                        }}
                                    />
                                    .
                                    <HighlightedWord
                                        color={colors.error}
                                        word={column}
                                    />
                                </span>
                            );
                        }
                    }
                }

                return (
                    <HighlightedWord
                        key={tokenKey}
                        color={colors.error}
                        word={token.value}
                    />
                );
            })}
        </>
    );
}
