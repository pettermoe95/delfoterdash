import { useRef } from 'react';
import { SchemaForm } from '../forms/SchemaForm';
import { incrementalSchema, schedulingSchema } from '../model/schema';
import type { ValidationIssue } from '../model/validation';
import type { EditorController } from '../state/useEditor';
import { useValidationFocus } from './useValidationFocus';
import { ValidationIssues } from './ValidationIssues';
import type { ValidationTarget } from './ValidationIssues';

type WorkflowPropertiesProps = {
    editor: EditorController;
    issues: ValidationIssue[];
    onIssueSelect: (issue: ValidationIssue) => void;
    focusTarget?: ValidationTarget;
    onValidationFocused: (target: ValidationTarget) => void;
};
export function WorkflowProperties({
    editor,
    issues,
    onIssueSelect,
    focusTarget,
    onValidationFocused,
}: WorkflowPropertiesProps) {
    const panel = useRef<HTMLDivElement>(null);
    useValidationFocus(
        panel,
        focusTarget && !focusTarget.jobId ? focusTarget : undefined,
        onValidationFocused
    );
    const sectionErrors = (section: string) =>
        issues.filter((issue) => issue.path.startsWith(`${section}.`));
    const updateScheduling = (value: unknown) =>
        editor.edit(
            (document) => ({
                ...document,
                scheduling: value as typeof document.scheduling,
            }),
            'scheduling'
        );
    const updateIncremental = (value: unknown) =>
        editor.edit(
            (document) => ({
                ...document,
                incremental: value as typeof document.incremental,
            }),
            'incremental'
        );
    const finishEditing = () => editor.dispatch({ type: 'endGroup' });
    return (
        <>
            <div className="we-panel-heading">
                <h2>Workflow properties</h2>
                <p>Select a worker to edit its configuration.</p>
            </div>
            <div
                className="we-panel-content"
                ref={panel}
                onBlurCapture={finishEditing}
            >
                <label className="we-field">
                    Workflow name
                    <input
                        value={editor.name}
                        onChange={(event) => editor.setName(event.target.value)}
                    />
                </label>
                <label className="we-row we-field">
                    <input
                        type="checkbox"
                        checked={editor.enabled}
                        onChange={(event) =>
                            editor.setEnabled(event.target.checked)
                        }
                    />
                    Enable scheduled execution
                </label>
                <section>
                    <h3>Schedule</h3>
                    <SchemaForm
                        schema={schedulingSchema}
                        pathPrefix="scheduling"
                        environment={{
                            hints: {
                                'scheduling.interval': {
                                    label: 'Interval (seconds)',
                                    help: 'Use an interval of at least 60 seconds.',
                                },
                                'scheduling.time': {
                                    label: 'Time (HH:mm)',
                                    help: 'The scheduler uses Europe/Oslo time.',
                                },
                            },
                            errors: sectionErrors('scheduling'),
                        }}
                        value={editor.document.scheduling}
                        onChange={updateScheduling}
                    />
                </section>
                <section>
                    <h3>Incremental range</h3>
                    <SchemaForm
                        schema={incrementalSchema}
                        pathPrefix="incremental"
                        environment={{ errors: sectionErrors('incremental') }}
                        value={editor.document.incremental}
                        onChange={updateIncremental}
                    />
                </section>
                <ValidationIssues
                    issues={issues}
                    onSelect={onIssueSelect}
                    expanded={issues.length > 0}
                />
                <small>
                    Incomplete drafts can be saved. Execution requires valid
                    configuration. Disable scheduled execution before saving an
                    incomplete draft.
                </small>
            </div>
        </>
    );
}
