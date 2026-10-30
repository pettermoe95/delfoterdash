// useSyncMetricForm.ts
import type { DashboardGraphQuery } from '@bv/api';
import { useCallback, useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface SyncMetricsFormProps {
    form: UseFormReturn<DashboardGraphQuery>;
    query: DashboardGraphQuery | undefined;
    isShowingTimeFilter: boolean;
    transform: (
        q: DashboardGraphQuery,
        metricName: string
    ) => DashboardGraphQuery;
    metricName: string;
}

/**
 * Keeps the form in sync with external query without clobbering user edits.
 * Provides an "ignoreEmitRef" flag that you can use to silence watch emissions
 * while we programmatically reset the form.
 */
export function useSyncMetricForm({
    form,
    query,
    isShowingTimeFilter,
    transform,
    metricName,
}: SyncMetricsFormProps) {
    const prevTFRef = useRef(isShowingTimeFilter);
    const prevQueryRef = useRef<DashboardGraphQuery | undefined>(query);
    const ignoreEmitRef = useRef(false);

    const silentReset = useCallback(
        (next: DashboardGraphQuery) => {
            ignoreEmitRef.current = true;
            form.reset(next, { keepDirty: false });
            // let RHF flush; then re-enable emissions
            queueMicrotask(() => {
                ignoreEmitRef.current = false;
            });
        },
        [form]
    );

    // Force-resync on TF OFF→ON
    useEffect(() => {
        const flippedOn = !prevTFRef.current && isShowingTimeFilter;
        prevTFRef.current = isShowingTimeFilter;
        if (flippedOn && query) {
            silentReset(transform(query, metricName));
        }
    }, [isShowingTimeFilter, query, form, metricName, silentReset, transform]);

    // Resync on external query change only if form is NOT dirty
    useEffect(() => {
        if (query === prevQueryRef.current) return;
        prevQueryRef.current = query;
        if (query && !form.formState.isDirty) {
            silentReset(transform(query, metricName));
        }
    }, [query, form, metricName, silentReset, transform]);

    return { ignoreEmitRef };
}
