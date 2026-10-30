import { ReactFlowProvider } from '@xyflow/react';
import { useAuthentication } from '~/hooks/useAuthentication';
import { APP_ROUTES, getCustomerWorkflowsPath } from '~/routes/routes';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from './canvas/Canvas';
import { ActivityResizeHandle } from './components/ActivityResizeHandle';
import { RunWorkflowDialog } from './components/RunWorkflowDialog';
import { Toolbar } from './components/Toolbar';
import { WorkflowJsonDialog } from './components/WorkflowJsonDialog';
import type { ValidationIssue } from './model/validation';
import { Activity } from './panels/Activity';
import { DatabaseConnectionsDialog } from './panels/database/DatabaseConnectionsDialog';
import type { DatabaseTarget } from './panels/database/DatabaseConnectionsDialog';
import { Palette } from './panels/Palette';
import type { ValidationTarget } from './panels/ValidationIssues';
import { ValidationIssuesDialog } from './panels/ValidationIssuesDialog';
import { WorkerProperties } from './panels/WorkerProperties';
import { WorkflowProperties } from './panels/WorkflowProperties';
import { useDocumentValidation } from './state/useDocumentValidation';
import { useEditor } from './state/useEditor';
import { useEditorTheme } from './state/useEditorTheme';
import { useShortcuts } from './state/useShortcuts';
import { useUnsavedChanges } from './state/useUnsavedChanges';
import '@xyflow/react/dist/style.css';
import './styles/editor.css';

type EditorContentProps = { workflowId: string };
function EditorContent({ workflowId }: EditorContentProps) {
    const editor = useEditor(workflowId);
    const { theme, toggleTheme } = useEditorTheme();
    const navigate = useNavigate();
    const [paletteOpen, setPaletteOpen] = useState(true);
    const [propertiesOpen, setPropertiesOpen] = useState(true);
    const [activityOpen, setActivityOpen] = useState(false);
    const [activityHeight, setActivityHeight] = useState(230);
    const [focusTarget, setFocusTarget] = useState<ValidationTarget>();
    const finishValidationFocus = useCallback((target: ValidationTarget) => {
        setFocusTarget((current) => (current === target ? undefined : current));
    }, []);
    const [databaseTarget, setDatabaseTarget] = useState<DatabaseTarget>();
    const openDatabases = (id?: string) => setDatabaseTarget({ id });
    const [dialog, setDialog] = useState<'json' | 'run' | 'issues' | null>(
        null
    );
    const issues = useDocumentValidation(editor.document);
    const focusIssue = (issue: ValidationIssue) => {
        setDialog(null);
        if (issue.connectionId) {
            setDatabaseTarget({ id: issue.connectionId, path: issue.path });
            return;
        }
        editor.setSelectedIds(issue.jobId ? [issue.jobId] : []);
        setPropertiesOpen(true);
        setFocusTarget({ jobId: issue.jobId, path: issue.path });
    };
    const showValidationStatus = () => {
        if (issues.length) setDialog('issues');
        else {
            editor.setSelectedIds([]);
            setPropertiesOpen(true);
        }
    };
    useUnsavedChanges(editor.dirty);
    useShortcuts(editor);
    const selected = editor.document.jobs.find((job) =>
        editor.selectedIds.includes(job.id)
    );
    if (editor.loading)
        return (
            <div
                className="we-editor we-loading"
                data-theme={theme}
                role="status"
            >
                Loading workflow…
            </div>
        );
    if (editor.loadError)
        return (
            <div className="we-editor we-loading" data-theme={theme}>
                <h1>Could not open workflow</h1>
                <p role="alert">{editor.loadError}</p>
                <button type="button" onClick={editor.retryLoad}>
                    Retry
                </button>
                <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.customers)}
                >
                    Back to customers
                </button>
            </div>
        );
    return (
        <div className="we-editor" data-theme={theme}>
            <Toolbar
                editor={editor}
                theme={theme}
                onToggleTheme={toggleTheme}
                paletteOpen={paletteOpen}
                propertiesOpen={propertiesOpen}
                onTogglePalette={() => setPaletteOpen((open) => !open)}
                onToggleProperties={() => setPropertiesOpen((open) => !open)}
                onRun={() => {
                    editor.setNotice('');
                    setDialog('run');
                }}
                onJson={() => setDialog('json')}
                onActivity={() => setActivityOpen((open) => !open)}
                onDatabases={() => openDatabases()}
                onClose={() =>
                    navigate(
                        editor.tenantId
                            ? getCustomerWorkflowsPath(editor.tenantId)
                            : APP_ROUTES.customers
                    )
                }
            />
            <div className="we-workspace">
                {paletteOpen && (
                    <Palette onAdd={editor.addWorker} disabled={editor.busy} />
                )}
                <div className="we-center">
                    <Canvas
                        editor={editor}
                        issues={issues}
                        theme={theme}
                        focusTarget={focusTarget}
                        onIssueSelect={focusIssue}
                    />
                    {activityOpen && (
                        <>
                            <ActivityResizeHandle
                                height={activityHeight}
                                onResize={setActivityHeight}
                            />
                            <Activity
                                height={activityHeight}
                                entries={editor.activity}
                                events={editor.liveJobs.events}
                                onClose={() => setActivityOpen(false)}
                            />
                        </>
                    )}
                </div>
                {propertiesOpen && (
                    <aside
                        className="we-properties"
                        aria-label="Properties editor"
                    >
                        <fieldset disabled={editor.busy}>
                            {selected ? (
                                <WorkerProperties
                                    key={selected.id}
                                    editor={editor}
                                    job={selected}
                                    issues={issues}
                                    onIssueSelect={focusIssue}
                                    focusTarget={focusTarget}
                                    onValidationFocused={finishValidationFocus}
                                    onDatabases={openDatabases}
                                />
                            ) : (
                                <WorkflowProperties
                                    editor={editor}
                                    issues={issues}
                                    onIssueSelect={focusIssue}
                                    focusTarget={focusTarget}
                                    onValidationFocused={finishValidationFocus}
                                />
                            )}
                        </fieldset>
                    </aside>
                )}
            </div>
            <footer className="we-statusbar">
                {editor.liveJobs.error && (
                    <span role="status" className="we-error">
                        {editor.liveJobs.error}{' '}
                        <button type="button" onClick={editor.liveJobs.retry}>
                            Retry live updates
                        </button>
                    </span>
                )}
                <span>
                    {editor.document.jobs.length} workers ·{' '}
                    {editor.document.jobs.reduce(
                        (sum, job) => sum + job.dependencies.length,
                        0
                    )}{' '}
                    connections
                </span>
                <button
                    type="button"
                    aria-haspopup={issues.length ? 'dialog' : undefined}
                    onClick={showValidationStatus}
                >
                    {issues.length
                        ? `${issues.length} configuration issue${issues.length === 1 ? '' : 's'}`
                        : 'Configuration valid'}
                </button>
                <span>Each worker waits for all connected workers</span>
            </footer>
            {dialog === 'issues' && (
                <ValidationIssuesDialog
                    issues={issues}
                    onSelect={focusIssue}
                    onClose={() => setDialog(null)}
                />
            )}
            {dialog === 'json' && (
                <WorkflowJsonDialog
                    document={editor.document}
                    onClose={() => setDialog(null)}
                />
            )}
            {databaseTarget && (
                <DatabaseConnectionsDialog
                    editor={editor}
                    target={databaseTarget}
                    issues={issues}
                    onClose={() => setDatabaseTarget(undefined)}
                    onWorkerSelect={(id) => {
                        editor.setSelectedIds([id]);
                        setFocusTarget({ jobId: id, path: 'databaseConfig' });
                        setPropertiesOpen(true);
                        setDatabaseTarget(undefined);
                    }}
                />
            )}
            {dialog === 'run' && (
                <RunWorkflowDialog
                    editor={editor}
                    issueCount={issues.length}
                    onClose={() => setDialog(null)}
                    onQueued={() => setActivityOpen(true)}
                />
            )}
        </div>
    );
}
export default function WorkflowEditorV2() {
    const { workflowId } = useParams();
    const { auth } = useAuthentication();
    if (!auth) return <div role="status">Loading…</div>;
    if (
        !(auth.permissions ?? []).some(
            (permission) =>
                permission.name === 'system_admin.admin_panel.access'
        )
    )
        return <div>Forbidden</div>;
    if (!workflowId) return <div>Missing workflow ID.</div>;
    return (
        <ReactFlowProvider key={workflowId}>
            <EditorContent workflowId={workflowId} />
        </ReactFlowProvider>
    );
}
