import { buildRequest } from '../api/persistence';
import type { WorkflowDocument } from '../model/schema';
import { Dialog } from './Dialog';

type WorkflowJsonDialogProps = {
    document: WorkflowDocument;
    onClose: () => void;
};
export function WorkflowJsonDialog({
    document,
    onClose,
}: WorkflowJsonDialogProps) {
    let configuration: unknown;
    let error: string | undefined;
    try {
        configuration = JSON.parse(buildRequest(document).configuration);
    } catch (cause) {
        error =
            cause instanceof Error
                ? cause.message
                : 'Could not build execution configuration.';
    }
    return (
        <Dialog title="Workflow JSON" onClose={onClose}>
            <p>Execution configuration sent to the API</p>
            {error ? (
                <p className="we-error" role="alert">
                    {error}
                </p>
            ) : (
                <pre>{JSON.stringify(configuration, null, 2)}</pre>
            )}
            <p>Editor document</p>
            <pre>{JSON.stringify(document, null, 2)}</pre>
        </Dialog>
    );
}
