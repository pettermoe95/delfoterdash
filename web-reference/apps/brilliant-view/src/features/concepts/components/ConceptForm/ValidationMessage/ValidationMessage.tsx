import type { ConceptType } from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';

interface ValidationMessageProps {
    expression: string;
    conceptType: ConceptType;
    validationResult: { valid: boolean; message?: string } | undefined;
    isValidating: boolean;
}

export function ValidationMessage({
    expression,
    validationResult,
    isValidating,
}: ValidationMessageProps) {
    const localize = useLocalize();
    if (!expression) {
        return (
            <p className="text-primary bv-text-font-sm-regular">
                {localize('concepts.form.enterExpression')}
            </p>
        );
    }
    if (isValidating)
        return <p className="animate-pulse bv-text-font-sm-regular">...</p>;

    if (!validationResult)
        return <p className="animate-pulse bv-text-font-sm-regular">...</p>;

    return validationResult.valid ? (
        <p className="text-[var(--border-success)] bv-text-font-sm-regular">
            {localize('concepts.form.expressionValid')}
        </p>
    ) : (
        <p className="text-[var(--border-error)] bv-text-font-sm-regular">
            {validationResult.message ||
                localize('concepts.form.expressionInvalid')}
        </p>
    );
}
