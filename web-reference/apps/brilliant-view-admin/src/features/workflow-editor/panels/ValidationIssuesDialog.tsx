import { Dialog } from '../components/Dialog';
import type { ValidationIssue } from '../model/validation';
import { ValidationIssueList } from './ValidationIssues';

type ValidationIssuesDialogProps = {
    issues: ValidationIssue[];
    onSelect: (issue: ValidationIssue) => void;
    onClose: () => void;
};

export function ValidationIssuesDialog({
    issues,
    onSelect,
    onClose,
}: ValidationIssuesDialogProps) {
    return (
        <Dialog
            title="Configuration issues"
            className="we-validation-dialog"
            onClose={onClose}
        >
            {issues.length ? (
                <>
                    <p>
                        Select an issue to open and focus the affected
                        configuration.
                    </p>
                    <ValidationIssueList issues={issues} onSelect={onSelect} />
                </>
            ) : (
                <p>Configuration valid.</p>
            )}
        </Dialog>
    );
}
