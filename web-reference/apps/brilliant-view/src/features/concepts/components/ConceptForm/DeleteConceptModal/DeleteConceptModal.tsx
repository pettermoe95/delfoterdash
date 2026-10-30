import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@brilliant/bds-core';
import type { Concept } from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';

type DeleteConceptModalProps = {
    concept: Concept;
    onDelete?: () => Promise<void> | void;
    disabled?: boolean;
    isDeleting?: boolean;
};

export function DeleteConceptModal({
    concept,
    onDelete,
    disabled = false,
    isDeleting = false,
}: DeleteConceptModalProps) {
    const localize = useLocalize();
    const [isOpen, setIsOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const conceptLabel =
        concept.concept_name_pretty || concept.concept_name || 'this concept';

    const handleDeleteConcept = async () => {
        if (!onDelete) return;
        setDeleteError(null);
        try {
            await onDelete();
            setIsOpen(false);
        } catch (error) {
            setDeleteError(
                error instanceof Error
                    ? error.message
                    : localize('concepts.toastDeleteFailed')
            );
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!isDeleting) {
                    setDeleteError(null);
                    setIsOpen(open);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button
                    color="error"
                    size="sm"
                    leftIcon="bv:trash"
                    disabled={disabled}
                >
                    {localize('miscTerms.delete')}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="w-[min(480px,90vw)]"
                aria-describedby={undefined}
            >
                <DialogHeader>
                    <DialogTitle
                        titleIconColor="red"
                        titleIconName="bv:alert-circle"
                    >
                        {localize('concepts.form.deleteQuestion')}
                    </DialogTitle>
                    <DialogDescription>
                        {localize('concepts.form.deleteWarning1')}
                        <span className="font-semibold">{conceptLabel}</span>.
                        {localize('concepts.form.deleteWarning2')}
                    </DialogDescription>
                </DialogHeader>
                {deleteError && (
                    <p className="text-error-primary bv-text-font-sm-regular">
                        {deleteError}
                    </p>
                )}
                <div className="flex items-center justify-end gap-sm">
                    <Button
                        size="sm"
                        color="gray"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                    >
                        {localize('miscTerms.cancel')}
                    </Button>
                    <Button
                        color="error"
                        size="sm"
                        leftIcon="bv:trash"
                        onClick={handleDeleteConcept}
                        disabled={disabled}
                    >
                        {isDeleting
                            ? localize('miscTerms.deleting')
                            : localize('concepts.form.deleteConcept')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
