import { useEffect, useRef, useState } from 'react';
import { buildSuggestions } from './autocompleteHelpers';
import type {
    ReplaceRange,
    Suggestion,
    SuggestionPosition,
    SyntaxKeywords,
} from './types';

type UseSyntaxAutocompleteArgs = {
    keywords: SyntaxKeywords;
    value: string | undefined;
    disabled: boolean;
    onChange?: (value: React.ChangeEvent<HTMLTextAreaElement>) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    containerRef: React.RefObject<HTMLDivElement>;
    mirrorRef: React.RefObject<HTMLDivElement>;
};

export function useAutocomplete({
    keywords,
    value,
    disabled,
    onChange,
    textareaRef,
    containerRef,
    mirrorRef,
}: UseSyntaxAutocompleteArgs) {
    const suggestionItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const suppressSuggestionsRef = useRef(false);
    const lastInputTypeRef = useRef<string | null>(null);

    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [replaceRange, setReplaceRange] = useState<ReplaceRange | null>(null);
    const [suggestionPosition, setSuggestionPosition] =
        useState<SuggestionPosition>(null);

    // Keep active suggestion in view
    useEffect(() => {
        const item = suggestionItemRefs.current[activeSuggestionIndex];
        if (!item) return;
        item.scrollIntoView({ block: 'nearest' });
    }, [activeSuggestionIndex]);

    const clearSuggestions = () => {
        setSuggestions([]);
        setReplaceRange(null);
        setActiveSuggestionIndex(0);
        setSuggestionPosition(null);
    };

    const updateSuggestionPosition = (text: string, index: number) => {
        if (
            !textareaRef.current ||
            !mirrorRef.current ||
            !containerRef.current
        ) {
            return;
        }

        const textarea = textareaRef.current;
        const mirror = mirrorRef.current;
        const containerRect = containerRef.current.getBoundingClientRect();
        const style = window.getComputedStyle(textarea);

        mirror.style.font = style.font;
        mirror.style.padding = style.padding;
        mirror.style.border = style.border;
        mirror.style.boxSizing = style.boxSizing;
        mirror.style.letterSpacing = style.letterSpacing;
        mirror.style.lineHeight = style.lineHeight;
        mirror.style.width = `${textarea.clientWidth}px`;
        mirror.style.height = `${textarea.clientHeight}px`;
        mirror.scrollTop = textarea.scrollTop;
        mirror.scrollLeft = textarea.scrollLeft;

        mirror.textContent = text.slice(0, index);
        const marker = document.createElement('span');
        marker.textContent = '\u200b';
        mirror.appendChild(marker);

        const markerRect = marker.getBoundingClientRect();
        setSuggestionPosition({
            left: markerRect.left - containerRect.left,
            top: markerRect.bottom - containerRect.top,
        });

        mirror.textContent = '';
    };

    const updateSuggestions = (textOverride?: string) => {
        if (disabled || !textareaRef.current) {
            clearSuggestions();
            return;
        }

        const text = textOverride ?? value ?? '';
        const caret =
            textareaRef.current.selectionStart ?? text.length ?? text.length;

        const { suggestions: newSuggestions, replaceRange: range } =
            buildSuggestions({
                text,
                caret,
                keywords,
            });

        if (!newSuggestions.length || !range) {
            clearSuggestions();
            return;
        }

        setSuggestions(newSuggestions);
        setReplaceRange(range);
        setActiveSuggestionIndex(0);
        suggestionItemRefs.current = [];
        updateSuggestionPosition(text, range.start);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (onChange) onChange(e);

        if (suppressSuggestionsRef.current) {
            // this change came from applySuggestion
            suppressSuggestionsRef.current = false;
            clearSuggestions();
            return;
        }

        const inputType = lastInputTypeRef.current;
        lastInputTypeRef.current = null;

        const isDeletionInput =
            inputType === 'deleteContentBackward' ||
            inputType === 'deleteContentForward';

        if (isDeletionInput && suggestions.length === 0) {
            clearSuggestions();
            return;
        }

        updateSuggestions(e.target.value);
    };

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const nativeEvent = e.nativeEvent as InputEvent | undefined;
        lastInputTypeRef.current = nativeEvent?.inputType ?? null;
        if (nativeEvent?.inputType !== 'historyUndo') return;

        setTimeout(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const caret = textarea.selectionEnd ?? textarea.value.length;
            textarea.setSelectionRange(caret, caret);
        }, 0);
    };

    const handlePointerNav = () => {
        clearSuggestions();
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (suppressSuggestionsRef.current) return;

        const isSuggestionNavKey =
            e.key === 'ArrowDown' ||
            e.key === 'ArrowUp' ||
            e.key === 'Enter' ||
            e.key === 'Tab';

        if (suggestions.length > 0 && isSuggestionNavKey) return;

        const isCaretMoveKey =
            e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight' ||
            e.key === 'Home' ||
            e.key === 'End';

        if (isCaretMoveKey) {
            clearSuggestions();
            return;
        }

        const isDeletionKey = e.key === 'Backspace' || e.key === 'Delete';
        const isInsertKey = e.key.length === 1;

        if (isInsertKey) {
            updateSuggestions();
            return;
        }

        if (isDeletionKey) {
            if (suggestions.length > 0) {
                updateSuggestions();
            } else {
                clearSuggestions();
            }
        }
    };

    const applySuggestion = (suggestion: Suggestion) => {
        if (!replaceRange || !textareaRef.current) return;

        const textarea = textareaRef.current;
        const { start, end } = replaceRange;

        textarea.focus();
        textarea.setSelectionRange(start, end);

        const ok = document.execCommand(
            'insertText',
            false,
            suggestion.insertText
        );

        if (!ok) {
            textarea.setRangeText(suggestion.insertText, start, end, 'end');
        }

        clearSuggestions();
        suppressSuggestionsRef.current = true;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex((prev) =>
                Math.min(prev + 1, suggestions.length - 1)
            );
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
            return;
        }

        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            applySuggestion(suggestions[activeSuggestionIndex]);
            return;
        }

        if (e.key === 'Escape') {
            clearSuggestions();
        }
    };

    const handleScroll = (textForPosition: string) => {
        if (!replaceRange) return;
        updateSuggestionPosition(textForPosition, replaceRange.start);
    };

    const registerSuggestionItem = (
        index: number,
        el: HTMLButtonElement | null
    ) => {
        suggestionItemRefs.current[index] = el;
    };

    return {
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
    };
}
