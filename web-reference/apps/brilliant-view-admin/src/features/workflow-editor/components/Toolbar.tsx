import {
    mdiClose,
    mdiCodeJson,
    mdiCogOutline,
    mdiContentSaveOutline,
    mdiDatabaseOutline,
    mdiFileExportOutline,
    mdiFileImportOutline,
    mdiFormatListBulleted,
    mdiGraphOutline,
    mdiPlay,
    mdiRedo,
    mdiTuneVariant,
    mdiUndo,
    mdiViewGridOutline,
    mdiWeatherNight,
    mdiWhiteBalanceSunny,
} from '@mdi/js';
import { useReactFlow } from '@xyflow/react';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { downloadDocument, importDocument } from '../api/persistence';
import type { EditorController } from '../state/useEditor';
import type { EditorTheme } from '../state/useEditorTheme';
import { ButtonIcon } from './ButtonIcon';
import { MoreMenu } from './MoreMenu';
import { WorkflowTitle } from './WorkflowTitle';

type ToolbarProps = {
    editor: EditorController;
    theme: EditorTheme;
    onToggleTheme: () => void;
    paletteOpen: boolean;
    propertiesOpen: boolean;
    onTogglePalette: () => void;
    onToggleProperties: () => void;
    onRun: () => void;
    onJson: () => void;
    onActivity: () => void;
    onDatabases: () => void;
    onClose: () => void;
};
export function Toolbar({
    editor,
    theme,
    onToggleTheme,
    paletteOpen,
    propertiesOpen,
    onTogglePalette,
    onToggleProperties,
    onRun,
    onJson,
    onActivity,
    onDatabases,
    onClose,
}: ToolbarProps) {
    const input = useRef<HTMLInputElement>(null);
    const { fitView } = useReactFlow();
    const arrangeWorkers = () => {
        try {
            editor.arrangeWorkers();
            void fitView({ padding: 0.2, duration: 250 });
        } catch (error) {
            editor.notify(
                error instanceof Error
                    ? error.message
                    : 'Could not arrange workers.',
                'error'
            );
        }
    };
    const importWorkers = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            const document = importDocument(JSON.parse(await file.text()));
            editor.insertJobs(document.jobs, document.databaseConnections);
            editor.notify(
                `Imported ${document.jobs.length} workers. Workflow settings were retained.`,
                'success'
            );
        } catch (error) {
            editor.notify(
                `Import failed: ${error instanceof Error ? error.message : 'Invalid workflow file.'}`,
                'error'
            );
        }
    };
    return (
        <header className="we-toolbar">
            <WorkflowTitle
                name={editor.name}
                disabled={editor.busy}
                onChange={editor.setName}
                onFinish={() => editor.dispatch({ type: 'endGroup' })}
            />
            <nav aria-label="Workflow actions">
                <button
                    type="button"
                    onClick={onToggleTheme}
                    aria-pressed={theme === 'dark'}
                    aria-label="Dark mode"
                    title="Toggle dark mode"
                >
                    <ButtonIcon
                        path={
                            theme === 'dark'
                                ? mdiWeatherNight
                                : mdiWhiteBalanceSunny
                        }
                    />
                    {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
                <button
                    type="button"
                    aria-pressed={paletteOpen}
                    onClick={onTogglePalette}
                >
                    <ButtonIcon path={mdiViewGridOutline} /> Workers
                </button>
                <button
                    type="button"
                    aria-pressed={propertiesOpen}
                    onClick={onToggleProperties}
                >
                    <ButtonIcon path={mdiTuneVariant} /> Properties
                </button>
                <span className="we-separator" />
                <button
                    type="button"
                    disabled={!editor.history.past.length || editor.busy}
                    onClick={() => editor.dispatch({ type: 'undo' })}
                    title="Undo (⌘/Ctrl+Z)"
                >
                    <ButtonIcon path={mdiUndo} /> Undo
                </button>
                <button
                    type="button"
                    disabled={!editor.history.future.length || editor.busy}
                    onClick={() => editor.dispatch({ type: 'redo' })}
                    title="Redo (⌘/Ctrl+Shift+Z)"
                >
                    <ButtonIcon path={mdiRedo} /> Redo
                </button>
                <button type="button" onClick={onActivity}>
                    <ButtonIcon path={mdiFormatListBulleted} /> Activity
                </button>
                <MoreMenu>
                    <button
                        type="button"
                        onClick={onDatabases}
                        disabled={editor.busy}
                    >
                        <ButtonIcon path={mdiDatabaseOutline} /> Database
                        connections
                    </button>
                    <button
                        type="button"
                        disabled={editor.busy || !editor.document.jobs.length}
                        onClick={arrangeWorkers}
                    >
                        <ButtonIcon path={mdiGraphOutline} /> Arrange workers
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            editor.setSelectedIds([]);
                            if (!propertiesOpen) onToggleProperties();
                        }}
                    >
                        <ButtonIcon path={mdiCogOutline} /> Workflow settings
                    </button>
                    <button type="button" onClick={onJson}>
                        <ButtonIcon path={mdiCodeJson} /> JSON inspector
                    </button>
                    <button
                        type="button"
                        disabled={editor.busy}
                        onClick={() => input.current?.click()}
                    >
                        <ButtonIcon path={mdiFileImportOutline} /> Import
                        workers…
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            downloadDocument(editor.name, editor.document)
                        }
                    >
                        <ButtonIcon path={mdiFileExportOutline} /> Export
                        workflow…
                    </button>
                </MoreMenu>
                <span className="we-separator" />
                <button
                    type="button"
                    className="we-primary"
                    title="Save workflow (⌘/Ctrl+S)"
                    disabled={!editor.dirty || editor.busy}
                    onClick={() => void editor.save()}
                >
                    <ButtonIcon path={mdiContentSaveOutline} /> Save
                </button>
                <button
                    type="button"
                    className="we-run"
                    disabled={editor.busy}
                    onClick={onRun}
                >
                    <ButtonIcon path={mdiPlay} /> Run
                </button>
                <button type="button" onClick={onClose}>
                    <ButtonIcon path={mdiClose} /> Close
                </button>
            </nav>
            <input
                ref={input}
                hidden
                type="file"
                accept=".json,application/json"
                onChange={importWorkers}
            />
        </header>
    );
}
