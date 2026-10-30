import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { ValidationTarget } from './ValidationIssues';

/** Select by data values rather than interpolating configuration paths into CSS selectors. */
export function useValidationFocus(
    container: RefObject<HTMLDivElement>,
    target?: ValidationTarget,
    onFocused?: (target: ValidationTarget) => void
) {
    // Consuming the request must not cancel the brief visual highlight.
    const highlighted = useRef<HTMLElement>();
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const clearHighlight = useCallback(() => {
        clearTimeout(timer.current);
        highlighted.current?.removeAttribute('data-validation-focus');
        highlighted.current = undefined;
    }, []);
    useEffect(() => clearHighlight, [clearHighlight]);
    useEffect(() => {
        if (!target) return;
        const frame = requestAnimationFrame(() => {
            const panel = container.current;
            if (!panel) return;
            const fields = Array.from(
                panel.querySelectorAll<HTMLElement>('[data-field-path]')
            );
            let field: HTMLElement | undefined;
            let path = target.path;
            while (path && !field) {
                field = fields.find(
                    (field) => field.dataset.fieldPath === path
                );
                path = path.includes('.')
                    ? path.slice(0, path.lastIndexOf('.'))
                    : '';
            }
            clearHighlight();
            field ??= panel;
            highlighted.current = field;
            field.dataset.validationFocus = 'true';
            field.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
            const control =
                field.querySelector<HTMLElement>('input, select, textarea') ??
                field.querySelector<HTMLElement>('button');
            control?.focus({ preventScroll: true });
            timer.current = setTimeout(clearHighlight, 3000);
            onFocused?.(target);
        });
        return () => cancelAnimationFrame(frame);
    }, [container, target, onFocused, clearHighlight]);
}
