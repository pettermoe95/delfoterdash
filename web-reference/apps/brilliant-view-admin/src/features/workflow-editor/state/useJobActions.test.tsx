// @vitest-environment jsdom
import { act, useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { emptyDocument } from '../model/schema';
import type { WorkflowDocument } from '../model/schema';
import { required } from '../test/required';
import { soapFetcher } from '../workers/fetch/soap';
import { createHistory, historyReducer } from './history';
import type { History } from './history';
import { useJobActions } from './useJobActions';

it('initializes SOAP headers and undoes a version and header change together', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    let actions: ReturnType<typeof useJobActions>;
    let history: History | undefined;
    let undo: () => void;
    function Probe() {
        const [state, dispatch] = useReducer(
            historyReducer<WorkflowDocument>,
            createHistory(emptyDocument())
        );
        history = state;
        undo = () => dispatch({ type: 'undo' });
        actions = useJobActions({
            document: state.present,
            edit: (update, group) => dispatch({ type: 'edit', update, group }),
            setSelectedIds: vi.fn(),
        });
        return null;
    }
    const root = createRoot(document.createElement('div'));
    try {
        act(() => {
            root.render(<Probe />);
        });
        act(() => {
            actions.addWorker(soapFetcher, { x: 0, y: 0 });
        });
        const created = required(history).present.jobs[0];
        expect(created.config.soapVersion).toBe('1.1');
        expect(created.config.headers).toEqual({
            'Content-Type': 'text/xml; charset=utf-8',
        });
        act(() => {
            actions.updateJob(created.id, (job) => ({
                ...job,
                config: { ...job.config, soapVersion: '1.2' },
            }));
        });
        expect(required(history).present.jobs[0].config.headers).toEqual({
            'Content-Type': 'application/soap+xml; charset=utf-8',
        });
        act(() => {
            undo();
        });
        expect(required(history).present.jobs[0]).toEqual(created);
    } finally {
        act(() => {
            root.unmount();
        });
    }
});
