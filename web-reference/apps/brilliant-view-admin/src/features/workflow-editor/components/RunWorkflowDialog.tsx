import { mdiContentSaveOutline, mdiPlay } from '@mdi/js';
import { useState } from 'react';
import type { EditorController } from '../state/useEditor';
import { ButtonIcon } from './ButtonIcon';
import { Dialog } from './Dialog';

type RunWorkflowDialogProps = {
    editor: EditorController;
    issueCount: number;
    onClose: () => void;
    onQueued: () => void;
};
export function RunWorkflowDialog({
    editor,
    issueCount,
    onClose,
    onQueued,
}: RunWorkflowDialogProps) {
    // Saving updates editor.dirty before queuing finishes; keep the dialog stable until it closes.
    const [hasUnsavedChanges] = useState(editor.dirty);
    const [noticeBeforeRun, setNoticeBeforeRun] = useState(editor.notice);
    const notice = editor.busy ? noticeBeforeRun : editor.notice;
    const run = async (saveFirst: boolean) => {
        setNoticeBeforeRun(editor.notice);
        if (await editor.run(saveFirst)) {
            onClose();
            onQueued();
        }
    };
    return (
        <Dialog
            title="Run workflow"
            className="we-run-dialog"
            onClose={() => {
                if (!editor.busy) onClose();
            }}
        >
            <p>
                {hasUnsavedChanges
                    ? 'There are unsaved changes. Choose which version to run.'
                    : 'Run the saved workflow configuration.'}
            </p>
            {issueCount > 0 && hasUnsavedChanges && (
                <p>
                    {issueCount} local configuration issue(s) must be resolved
                    before saving and running. Incomplete drafts can still be
                    saved.
                </p>
            )}
            {notice && <p role="status">{notice}</p>}
            <div className="we-run-actions">
                {hasUnsavedChanges && (
                    <button
                        type="button"
                        className="we-primary"
                        disabled={editor.busy || issueCount > 0}
                        aria-busy={editor.busy}
                        onClick={() => run(true)}
                    >
                        <span
                            className="we-run-label"
                            aria-hidden={editor.busy}
                        >
                            <ButtonIcon path={mdiContentSaveOutline} /> Save and
                            run
                        </span>
                        {editor.busy && (
                            <span className="we-run-loading">
                                <span
                                    className="we-spinner"
                                    aria-hidden="true"
                                />{' '}
                                Loading…
                            </span>
                        )}
                    </button>
                )}
                <button
                    type="button"
                    className={
                        hasUnsavedChanges ? 'we-run-secondary' : 'we-primary'
                    }
                    disabled={editor.busy}
                    aria-busy={editor.busy}
                    onClick={() => run(false)}
                >
                    <span className="we-run-label" aria-hidden={editor.busy}>
                        <ButtonIcon path={mdiPlay} /> Run saved version
                    </span>
                    {editor.busy && (
                        <span className="we-run-loading">
                            <span className="we-spinner" aria-hidden="true" />{' '}
                            Loading…
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    className="we-run-cancel"
                    disabled={editor.busy}
                    onClick={() => onClose()}
                >
                    Cancel
                </button>
            </div>
        </Dialog>
    );
}
