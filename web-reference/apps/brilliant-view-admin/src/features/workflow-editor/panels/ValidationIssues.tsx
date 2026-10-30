import type { ValidationIssue } from '../model/validation';

export type ValidationTarget = Pick<ValidationIssue, 'jobId' | 'path'>;
type ValidationIssuesProps = {
    issues: ValidationIssue[];
    onSelect: (issue: ValidationIssue) => void;
    expanded?: boolean;
};

type ValidationIssueListProps = Pick<
    ValidationIssuesProps,
    'issues' | 'onSelect'
>;

export function ValidationIssueList({
    issues,
    onSelect,
}: ValidationIssueListProps) {
    const renderIssue = (issue: ValidationIssue, index: number) => (
        <li key={index}>
            <button
                type="button"
                className="we-validation-link"
                onClick={() => onSelect(issue)}
            >
                {issue.jobId ??
                    (issue.connectionId
                        ? 'Database connection'
                        : 'Workflow')}{' '}
                · {issue.path}: {issue.message}
            </button>
        </li>
    );
    return <ul className="we-validation-list">{issues.map(renderIssue)}</ul>;
}

export function ValidationIssues({
    issues,
    onSelect,
    expanded = false,
}: ValidationIssuesProps) {
    return (
        <details open={expanded || undefined} className="we-validation">
            <summary>
                {issues.length
                    ? `${issues.length} configuration issue${issues.length === 1 ? '' : 's'}`
                    : 'Workflow is valid'}
            </summary>
            <ValidationIssueList issues={issues} onSelect={onSelect} />
        </details>
    );
}
