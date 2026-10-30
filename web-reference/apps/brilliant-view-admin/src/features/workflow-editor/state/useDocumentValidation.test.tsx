// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { emptyDocument } from '../model/schema';
import type { WorkflowDocument } from '../model/schema';
import type { ValidationIssue } from '../model/validation';
import { required } from '../test/required';
import { useDocumentValidation } from './useDocumentValidation';

type ProbeProps = { document: WorkflowDocument };
it('reuses validation for movement while revalidating configuration, connections, settings and undo', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    let issues: ValidationIssue[] | undefined;
    function Probe({ document }: ProbeProps) {
        issues = useDocumentValidation(document);
        return null;
    }
    const root = createRoot(document.createElement('div'));
    const original = {
        ...emptyDocument(),
        jobs: [
            {
                id: 'load',
                name: 'Load',
                type: 'JsonLoader',
                config: {},
                dependencies: [],
                execution: {},
                position: { x: 0, y: 0 },
            },
        ],
    };
    const render = (document: WorkflowDocument) => {
        act(() => {
            root.render(<Probe document={document} />);
        });
        return required(issues);
    };
    try {
        const baseline = render(original);
        expect(baseline).toEqual([]);
        const moved = {
            ...original,
            jobs: original.jobs.map((job) => ({
                ...job,
                position: { x: 100, y: 200 },
            })),
        };
        expect(render(moved)).toBe(baseline);
        const changed = {
            ...moved,
            jobs: moved.jobs.map((job) => ({
                ...job,
                config: { identityColumns: [''] },
            })),
        };
        expect(render(changed)).not.toEqual([]);
        expect(render(original)).toEqual([]);
        expect(
            render({
                ...original,
                jobs: original.jobs.map((job) => ({
                    ...job,
                    dependencies: ['missing'],
                })),
            })
        ).toMatchObject([{ path: 'dependencies' }]);
        expect(
            render({ ...original, scheduling: { type: 'interval' } }).length
        ).toBeGreaterThan(0);
        expect(
            render({
                ...original,
                databaseConnections: [{ id: 'db', name: '', config: {} }],
            }).length
        ).toBeGreaterThan(0);
        expect(
            render({
                ...original,
                jobs: original.jobs.map((job) => ({
                    ...job,
                    position: { x: NaN, y: 0 },
                })),
            }).length
        ).toBeGreaterThan(0);
        expect(render(original)).toEqual([]);
    } finally {
        act(() => {
            root.unmount();
        });
    }
});
