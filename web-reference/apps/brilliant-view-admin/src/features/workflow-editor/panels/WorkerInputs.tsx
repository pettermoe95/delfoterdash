import type { ChangeEvent } from 'react';
import { CloseIcon } from '../components/CloseIcon';
import { useSortableList } from '../components/useSortableList';
import { canConnect, withDependencies } from '../model/graph';
import { reorderListItem } from '../model/listOrder';
import type { EditorJob } from '../model/schema';
import type { EditorController } from '../state/useEditor';

type WorkerInputsProps = {
    editor: EditorController;
    job: EditorJob;
    upstream: EditorJob[];
};
export function WorkerInputs({ editor, job, upstream }: WorkerInputsProps) {
    const sortable = useSortableList(upstream.length, (from, to) =>
        editor.updateJob(job.id, (current) =>
            withDependencies(
                current,
                reorderListItem(
                    current.dependencies,
                    current.dependencies.indexOf(upstream[from].id),
                    current.dependencies.indexOf(upstream[to].id)
                )
            )
        )
    );
    const addConnection = (event: ChangeEvent<HTMLSelectElement>) => {
        const source = event.target.value;
        if (source && canConnect(editor.document.jobs, source, job.id))
            editor.updateJob(job.id, (current) =>
                withDependencies(current, [...current.dependencies, source])
            );
    };
    const renderInput = (input: EditorJob, index: number) => {
        const disconnectInput = () =>
            editor.updateJob(job.id, (current) =>
                withDependencies(
                    current,
                    current.dependencies.filter((id) => id !== input.id)
                )
            );
        return (
            <div
                {...sortable.itemProps(index)}
                key={input.id}
                className="we-row we-input-connection"
            >
                {sortable.handle(index, `connection ${input.id}`)}
                <button
                    type="button"
                    className="we-input-name"
                    onClick={() => editor.setSelectedIds([input.id])}
                >
                    {input.id}
                </button>
                <button
                    type="button"
                    aria-label={`Disconnect ${input.id}`}
                    title={`Disconnect ${input.id}`}
                    onClick={disconnectInput}
                >
                    <CloseIcon />
                </button>
            </div>
        );
    };
    return (
        <section className="we-worker-inputs" data-field-path="dependencies">
            <h3>Connected workers</h3>
            <p>This worker waits for every connected worker to finish.</p>
            {!upstream.length && <p>No incoming connections.</p>}
            {upstream.map(renderInput)}
            <label className="we-field">
                Add connection
                <select value="" onChange={addConnection}>
                    <option value="">Choose upstream worker…</option>
                    {editor.document.jobs
                        .filter((item) =>
                            canConnect(editor.document.jobs, item.id, job.id)
                        )
                        .map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.id}
                            </option>
                        ))}
                </select>
            </label>
        </section>
    );
}
