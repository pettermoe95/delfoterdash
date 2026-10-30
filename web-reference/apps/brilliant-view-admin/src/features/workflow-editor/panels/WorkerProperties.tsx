import { Tabs, TabsContent } from '@bv/ui';
import { useEffect, useRef, useState } from 'react';
import { useCredentials } from '../api/credentials';
import { PropertiesTabs } from '../components/PropertiesTabs';
import { isRecord } from '../forms/schema';
import { SchemaForm } from '../forms/SchemaForm';
import type { EditorJob } from '../model/schema';
import type { ValidationIssue } from '../model/validation';
import type { EditorController } from '../state/useEditor';
import { configuredColumns } from '../workers/model/columns';
import { workerByType } from '../workers/registry';
import { WorkerDatabase } from './database/WorkerDatabase';
import { useValidationFocus } from './useValidationFocus';
import { ValidationIssues } from './ValidationIssues';
import type { ValidationTarget } from './ValidationIssues';
import { WorkerInputs } from './WorkerInputs';

type WorkerPropertiesProps = {
    editor: EditorController;
    job: EditorJob;
    issues: ValidationIssue[];
    onIssueSelect: (issue: ValidationIssue) => void;
    focusTarget?: ValidationTarget;
    onValidationFocused: (target: ValidationTarget) => void;
    onDatabases: (id?: string) => void;
};
export function WorkerProperties({
    editor,
    job,
    issues,
    onIssueSelect,
    focusTarget,
    onValidationFocused,
    onDatabases,
}: WorkerPropertiesProps) {
    const definition = workerByType(job.type);
    const jobIssues = issues.filter((issue) => issue.jobId === job.id);
    const hasDatabase =
        definition?.fields?.databaseConfig?.control === 'database';
    const [tab, setTab] = useState('Configuration');
    const panel = useRef<HTMLDivElement>(null);
    const target = focusTarget?.jobId === job.id ? focusTarget : undefined;
    const firstField = target?.path.split('.')[0];
    const targetTab =
        firstField === 'dependencies'
            ? 'Inputs'
            : (definition?.fields?.[firstField ?? '']?.section ??
              'Configuration');
    useEffect(() => {
        if (target) setTab(targetTab);
    }, [target, targetTab]);
    useValidationFocus(
        panel,
        tab === targetTab ? target : undefined,
        onValidationFocused
    );

    const [rename, setRename] = useState(job.id);
    const [renameError, setRenameError] = useState('');
    const credentials = useCredentials(editor.tenantId);
    const sections = [
        ...new Set(
            [
                'Configuration',
                ...Object.values(definition?.fields ?? {}).map(
                    (hint) => hint?.section ?? 'Configuration'
                ),
            ].filter((section) => section !== 'Inputs')
        ),
        'Inputs',
    ];
    const jobsById = new Map(
        editor.document.jobs.map((item) => [item.id, item])
    );
    const upstream = job.dependencies.flatMap((id) => {
        const input = jobsById.get(id);
        return input ? [input] : [];
    });
    const columns = [
        ...new Set(upstream.flatMap((item) => configuredColumns(item.config))),
    ];
    const updateConfig = (config: unknown) => {
        if (isRecord(config))
            editor.updateJob(
                job.id,
                (current) => ({ ...current, config }),
                `config:${job.id}`
            );
    };
    const changeTab = (section: string) => {
        setTab(section);
        editor.dispatch({ type: 'endGroup' });
    };
    return (
        <>
            <div className="we-panel-heading">
                <small>{definition?.name ?? job.type}</small>
                <h2>{job.id}</h2>
                <p>{definition?.description}</p>
            </div>
            <form
                className="we-rename we-row"
                onSubmit={(event) => {
                    event.preventDefault();
                    setRenameError(editor.renameWorker(job.id, rename) ?? '');
                }}
            >
                <input
                    aria-label="Worker name"
                    value={rename}
                    onChange={(event) => setRename(event.target.value)}
                />
                <button type="submit">Rename</button>
            </form>
            {renameError && (
                <p className="we-error" role="alert">
                    {renameError}
                </p>
            )}
            <Tabs
                value={tab}
                onValueChange={changeTab}
                className="we-properties-tabs"
            >
                <PropertiesTabs sections={sections} value={tab} />
                <TabsContent
                    value={tab}
                    className="we-panel-content"
                    data-compact={
                        Object.values(definition?.fields ?? {}).some(
                            (hint) =>
                                hint?.section === tab &&
                                hint.layout === 'compact'
                        ) || undefined
                    }
                    ref={panel}
                    aria-label={tab}
                    onFocusCapture={() => editor.dispatch({ type: 'endGroup' })}
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget))
                            editor.dispatch({ type: 'endGroup' });
                    }}
                >
                    {tab === 'Inputs' && (
                        <WorkerInputs
                            editor={editor}
                            job={job}
                            upstream={upstream}
                        />
                    )}
                    {tab === 'Authentication' && credentials.isError && (
                        <p className="we-error">
                            Credentials could not be loaded. Existing selections
                            are preserved.
                        </p>
                    )}
                    {definition && (
                        <SchemaForm
                            schema={definition.schema}
                            value={job.config}
                            onChange={updateConfig}
                            section={tab}
                            exclude={
                                hasDatabase ? ['databaseConfig'] : undefined
                            }
                            environment={{
                                hints: definition.fields,
                                credentials: credentials.data,
                                upstream: upstream.map((input) => ({
                                    id: input.id,
                                    name: input.id,
                                })),
                                columns,
                                errors: jobIssues,
                            }}
                        />
                    )}
                    {hasDatabase &&
                        tab === definition.fields?.databaseConfig?.section && (
                            <WorkerDatabase
                                editor={editor}
                                job={job}
                                definition={definition}
                                issues={jobIssues}
                                onManage={onDatabases}
                            />
                        )}
                    {!definition && (
                        <p>
                            Unknown worker type. Its saved configuration is
                            preserved.
                        </p>
                    )}
                    {jobIssues.length > 0 && (
                        <ValidationIssues
                            issues={jobIssues}
                            onSelect={onIssueSelect}
                            expanded={true}
                        />
                    )}
                </TabsContent>
            </Tabs>
            <footer className="we-panel-footer">
                <button
                    type="button"
                    className="we-danger"
                    onClick={() => editor.removeElements([job.id])}
                >
                    Delete worker
                </button>
            </footer>
        </>
    );
}
