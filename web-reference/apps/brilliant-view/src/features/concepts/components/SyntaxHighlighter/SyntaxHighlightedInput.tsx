import { cn, Tooltip } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';
import { useRef, useState } from 'react';
import { HighlightedText } from './highlighter.tsx';
import type { KeywordColors, Suggestion, SyntaxKeywords } from './types';
import { useAutocomplete } from './useAutocomplete';

type SyntaxHighlightedInputProps = {
    className: string;
    keywords: SyntaxKeywords;
    colors: KeywordColors;
    value?: string;
    disabled?: boolean;
    onChange?: (value: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function SyntaxHighlightedInput({
    className,
    keywords,
    colors,
    value,
    onChange,
    disabled = false,
}: SyntaxHighlightedInputProps) {
    const localize = useLocalize();
    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLDivElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipRect, setTooltipRect] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>({ x: 0, y: 0, width: 0, height: 0 });
    const [tooltipTitle, setTooltipTitle] = useState<string | null>(null);
    const [tooltipDescription, setTooltipDescription] =
        useState<React.ReactNode | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    const {
        suggestions,
        activeSuggestionIndex,
        replaceRange,
        suggestionPosition,
        handleChange,
        handleInput,
        handlePointerNav,
        handleKeyUp,
        handleKeyDown,
        handleScroll,
        clearSuggestions,
        setActiveSuggestionIndex,
        applySuggestion,
        registerSuggestionItem,
    } = useAutocomplete({
        keywords,
        value,
        disabled,
        onChange,
        textareaRef,
        containerRef,
        mirrorRef,
    });

    const showSuggestions = isFocused && suggestions.length > 0 && !disabled;
    const highlightQuery = replaceRange
        ? (value ?? '').slice(replaceRange.start, replaceRange.end)
        : '';

    const syncScroll = () => {
        if (!textareaRef.current || !preRef.current) return;
        preRef.current.scrollTop = textareaRef.current.scrollTop;
    };

    const onMouseEvent = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        const elems = document.elementsFromPoint(e.clientX, e.clientY);
        const second = elems[1];
        if (!second || !preRef.current) return;

        const title = second.getAttribute('tooltip-title');
        if (!title) {
            setTooltipOpen(false);
        } else {
            setTooltipTitle(title);
            const wordPos = second.getBoundingClientRect();
            const boxPos = preRef.current.getBoundingClientRect();
            setTooltipRect({
                x: wordPos.x - boxPos.x,
                y: wordPos.y - boxPos.y,
                width: wordPos.width,
                height: wordPos.height,
            });
            const description = second.getAttribute('tooltip-description');
            const desc = description
                ?.split('\n')
                .map((line, idx) => <div key={idx}>{line}</div>);
            setTooltipDescription(desc);
            setTooltipOpen(true);
        }
    };

    const highlightedSuggestionLabel = (label: string, query: string) => {
        if (!query) return label;
        const lowerLabel = label.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerLabel.indexOf(lowerQuery);
        if (index === -1) return label;
        const end = index + query.length;
        return (
            <>
                <span>{label.slice(0, index)}</span>
                <span className="font-bold text-[var(--fg-brand-secondary)]">
                    {label.slice(index, end)}
                </span>
                <span>{label.slice(end)}</span>
            </>
        );
    };

    return (
        <div
            data-component="syntax-highlighted-input"
            ref={containerRef}
            className={className + ' relative'}
            style={{
                fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: '1em',
                boxShadow: isFocused
                    ? 'var(--ring-brand), var(--shadow-sm)'
                    : 'var(--shadow-xs)',
            }}
        >
            {/* highlight layer */}
            <div
                ref={preRef}
                className="absolute left-0 top-0 h-full w-full overflow-hidden whitespace-pre-wrap break-words px-1 py-1"
            >
                <HighlightedText
                    input={value ?? ''}
                    keywords={keywords}
                    colors={colors}
                />
            </div>

            {/* mirror for caret-based suggestion positioning */}
            <div
                ref={mirrorRef}
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-full overflow-auto whitespace-pre-wrap break-words px-1 py-1"
                style={{
                    visibility: 'hidden',
                    pointerEvents: 'none',
                }}
            />

            {/* tooltip overlay */}
            <Tooltip
                open={tooltipOpen}
                title={tooltipTitle ?? ''}
                description={tooltipDescription ?? ''}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: `${tooltipRect.x}px`,
                        top: `${tooltipRect.y}px`,
                        width: `${tooltipRect.width}px`,
                        height: `${tooltipRect.height}px`,
                        pointerEvents: 'none',
                    }}
                />
            </Tooltip>

            {/* input */}
            <textarea
                id="syntax-highlight"
                ref={textareaRef}
                onKeyDown={(e) => {
                    handleKeyDown(e);
                }}
                onKeyUp={(e) => {
                    handleKeyUp(e);
                    syncScroll();
                }}
                onClick={() => {
                    handlePointerNav();
                    syncScroll();
                }}
                onMouseDown={() => {
                    handlePointerNav();
                    syncScroll();
                }}
                onMouseUp={() => {
                    handlePointerNav();
                    syncScroll();
                }}
                onMouseMove={onMouseEvent}
                onInput={handleInput}
                onScroll={() => {
                    syncScroll();
                    if (textareaRef.current) {
                        handleScroll(textareaRef.current.value);
                    }
                }}
                onFocus={() => {
                    setIsFocused(true);
                    handlePointerNav();
                }}
                onBlur={() => {
                    setIsFocused(false);
                    clearSuggestions();
                }}
                className={cn(
                    'absolute left-0 top-0 h-full w-full resize-none whitespace-pre-wrap border-none bg-transparent px-1 py-1 outline-none focus:outline-none focus:ring-0',
                    disabled
                        ? 'text-placeholder bv-text-font-sm-regular hover:cursor-not-allowed'
                        : 'break-words text-transparent caret-gray-500'
                )}
                onChange={handleChange}
                value={
                    disabled
                        ? localize('concepts.form.notApplicableToMetrics')
                        : (value ?? '')
                }
                disabled={disabled}
            />

            {/* autocomplete suggestions */}
            {showSuggestions && (
                <div
                    className="scrollbar-thin absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-solid border-primary bg-primary py-1 shadow-lg"
                    style={{
                        left: suggestionPosition?.left ?? 0,
                        top: suggestionPosition?.top ?? 0,
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {suggestions.map(
                        (suggestion: Suggestion, index: number) => (
                            <button
                                key={`${suggestion.type}-${suggestion.label}`}
                                type="button"
                                className={cn(
                                    'mx-1 flex w-[96%] items-center justify-between px-2 py-1 text-left text-sm',
                                    index === activeSuggestionIndex
                                        ? 'bg-active text-primary'
                                        : 'hover:active text-primary'
                                )}
                                ref={(el) => registerSuggestionItem(index, el)}
                                onMouseEnter={() =>
                                    setActiveSuggestionIndex(index)
                                }
                                onClick={() => applySuggestion(suggestion)}
                            >
                                <span>
                                    {highlightedSuggestionLabel(
                                        suggestion.label,
                                        highlightQuery
                                    )}
                                </span>
                                <span className="ml-2 text-xs uppercase text-placeholder">
                                    {suggestion.detail ??
                                        suggestion.type.replace('_', ' ')}
                                </span>
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
