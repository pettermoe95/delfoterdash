import { useToastContext } from '@bv/ui';
import type { ToastType } from '@bv/ui';
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '~/api/service';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
    configurationNeedsRepair,
    fetchWorkflow,
    loadDocument,
    persistWorkflow,
} from '../api/persistence';
import { isRecord } from '../forms/schema';
import { documentSchema, emptyDocument } from '../model/schema';
import type { WorkflowDocument } from '../model/schema';
import { validateDocument } from '../model/validation';
import { createHistory, historyReducer } from './history';
import { useJobActions } from './useJobActions';
import { useLiveJobs } from './useLiveJobs';

export type ActivityEntry = {
    id: string;
    time: string;
    message: string;
    error?: boolean;
};
type EditorDraft = {
    document: WorkflowDocument;
    name: string;
    enabled: boolean;
};
export function useEditor(workflowId: string) {
    const [history, dispatch] = useReducer(
        historyReducer<EditorDraft>,
        undefined,
        () =>
            createHistory({
                document: emptyDocument(),
                name: '',
                enabled: false,
            })
    );
    const [tenantId, setTenantId] = useState('');
    const liveJobs = useLiveJobs(workflowId, tenantId);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [loadAttempt, setLoadAttempt] = useState(0);
    const retryLoad = useCallback(
        () => setLoadAttempt((attempt) => attempt + 1),
        []
    );
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const { displayToast } = useToastContext();
    const notify = useCallback(
        (message: string, type: ToastType = 'info') => {
            setNotice(message);
            displayToast({ type, text: message, closable: true });
        },
        [displayToast]
    );
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activity, setActivity] = useState<ActivityEntry[]>([]);
    const [baseline, setBaseline] = useState({
        document: '',
        name: '',
        enabled: false,
    });
    const [migrationPending, setMigrationPending] = useState(false);
    const pending = useRef(false);
    const queryClient = useQueryClient();
    const { document, name, enabled } = history.present;
    useEffect(() => {
        const existing = new Set(document.jobs.map((job) => job.id));
        setSelectedIds((current) =>
            current.every((id) => existing.has(id))
                ? current
                : current.filter((id) => existing.has(id))
        );
    }, [document.jobs]);
    const setName = useCallback(
        (name: string) =>
            dispatch({
                type: 'edit',
                group: 'workflowName',
                update: (draft) => ({ ...draft, name }),
            }),
        []
    );
    const setEnabled = useCallback(
        (enabled: boolean) =>
            dispatch({
                type: 'edit',
                update: (draft) => ({ ...draft, enabled }),
            }),
        []
    );
    const addActivity = useCallback((message: string, error = false) => {
        setActivity((entries) => [
            ...entries.slice(-199),
            {
                id: crypto.randomUUID(),
                time: new Date().toISOString(),
                message,
                error,
            },
        ]);
    }, []);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError('');
        fetchWorkflow(workflowId)
            .then((details) => {
                const loaded = loadDocument(details);
                if (cancelled) return;
                dispatch({
                    type: 'reset',
                    document: {
                        document: loaded,
                        name: details.name,
                        enabled: details.enabled,
                    },
                });
                setTenantId(details.tenant_id);
                setBaseline({
                    document: JSON.stringify(loaded),
                    name: details.name,
                    enabled: details.enabled,
                });
                const savedLayout: unknown = details.layout.trim()
                    ? JSON.parse(details.layout)
                    : undefined;
                const legacy =
                    !isRecord(savedLayout) || savedLayout.version !== 2;
                const migrated =
                    legacy ||
                    JSON.stringify(documentSchema.parse(savedLayout)) !==
                        JSON.stringify(loaded) ||
                    configurationNeedsRepair(details.configuration);
                setMigrationPending(migrated);
                if (migrated)
                    notify(
                        legacy
                            ? 'Legacy workflow converted locally. Save to store the V2 layout.'
                            : 'Unset configuration values repaired locally. Save to update the workflow.'
                    );
            })
            .catch((error) => {
                if (!cancelled)
                    setLoadError(
                        error instanceof Error
                            ? error.message
                            : 'Could not load workflow.'
                    );
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [workflowId, notify, loadAttempt]);
    const dirty =
        !loading &&
        !loadError &&
        (migrationPending ||
            JSON.stringify(document) !== baseline.document ||
            name !== baseline.name ||
            enabled !== baseline.enabled);
    const edit = useCallback(
        (
            update: (value: WorkflowDocument) => WorkflowDocument,
            group?: string
        ) =>
            dispatch({
                type: 'edit',
                update: (draft) => ({
                    ...draft,
                    document: update(draft.document),
                }),
                group,
            }),
        []
    );
    const jobActions = useJobActions({ document, edit, setSelectedIds });

    const saveCurrent = async (): Promise<boolean> => {
        if (!name.trim()) {
            notify('A workflow name is required.', 'warning');
            return false;
        }
        if (enabled && validateDocument(document).length) {
            notify(
                'Disable scheduled execution before saving an incomplete draft.',
                'warning'
            );
            return false;
        }
        try {
            // Stop scheduled execution before persisting a potentially incomplete draft.
            if (baseline.enabled && !enabled) {
                await apiService.postData(
                    `/v1/admin/workflows/${workflowId}/disable`,
                    {}
                );
                setBaseline((current) => ({ ...current, enabled: false }));
            }
            await persistWorkflow(workflowId, document);
            setBaseline((current) => ({
                ...current,
                document: JSON.stringify(document),
            }));
            setMigrationPending(false);
            if (name !== baseline.name) {
                await apiService.postData(
                    `/v1/admin/workflows/${workflowId}/rename`,
                    { name }
                );
                setBaseline((current) => ({ ...current, name }));
            }
            if (enabled && !baseline.enabled) {
                await apiService.postData(
                    `/v1/admin/workflows/${workflowId}/enable`,
                    {}
                );
                setBaseline((current) => ({ ...current, enabled }));
            }
            notify('Workflow saved.', 'success');
            addActivity('Workflow saved.');
            return true;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Save failed.';
            notify(message, 'error');
            addActivity(message, true);
            return false;
        } finally {
            await queryClient.invalidateQueries({
                queryKey: ['workflows', tenantId] as const,
            });
        }
    };
    const save = async (): Promise<boolean> => {
        if (pending.current) return false;
        dispatch({ type: 'endGroup' });
        pending.current = true;
        setBusy(true);
        try {
            return await saveCurrent();
        } finally {
            pending.current = false;
            setBusy(false);
        }
    };
    const run = async (saveFirst: boolean): Promise<boolean> => {
        if (pending.current) return false;
        dispatch({ type: 'endGroup' });
        pending.current = true;
        setBusy(true);
        try {
            // Validate the actual saved version when running without saving local changes.
            let target = document;
            if (!saveFirst) {
                const details = await fetchWorkflow(workflowId);
                if (configurationNeedsRepair(details.configuration)) {
                    notify(
                        'The saved configuration contains unset values that need repair. Save the workflow before running it.',
                        'warning'
                    );
                    return false;
                }
                target = loadDocument(details);
            }
            const issues = validateDocument(target);
            if (issues.length) {
                notify(
                    `Cannot run: ${issues.length} configuration issue(s). ${issues[0].jobId ?? 'Workflow'}: ${issues[0].message}`,
                    'warning'
                );
                return false;
            }
            if (saveFirst && !(await saveCurrent())) return false;
            liveJobs.clear();
            await apiService.postData(
                `/v1/admin/workflows/${workflowId}/trigger`,
                {}
            );
            notify('Workflow queued.', 'success');
            addActivity('Workflow queued for execution.');
            return true;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not queue workflow.';
            notify(message, 'error');
            addActivity(message, true);
            return false;
        } finally {
            pending.current = false;
            setBusy(false);
        }
    };
    return {
        ...jobActions,
        document,
        history,
        dispatch,
        edit,
        name,
        setName,
        enabled,
        setEnabled,
        tenantId,
        loading,
        loadError,
        retryLoad,
        busy,
        notice,
        setNotice,
        notify,
        selectedIds,
        setSelectedIds,
        dirty,
        save,
        run,
        activity,
        liveJobs,
    };
}
export type EditorController = ReturnType<typeof useEditor>;
