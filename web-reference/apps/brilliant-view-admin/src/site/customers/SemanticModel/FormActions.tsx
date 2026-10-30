import { Button } from '@brilliant/bds-core';

type FormActionsProps = {
    onCancel: () => void;
    onDelete?: () => void;
    pending: boolean;
    submitLabel: string;
};

export function FormActions({
    onCancel,
    onDelete,
    pending,
    submitLabel,
}: FormActionsProps) {
    return (
        <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
                {submitLabel}
            </Button>
            <Button
                type="button"
                variant="outlined"
                color="gray"
                onClick={onCancel}
                disabled={pending}
            >
                Cancel
            </Button>
            {onDelete && (
                <Button
                    type="button"
                    color="error"
                    onClick={onDelete}
                    disabled={pending}
                >
                    Delete
                </Button>
            )}
        </div>
    );
}
