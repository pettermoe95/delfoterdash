import { atom, useAtomValue, useSetAtom } from 'jotai';

export type DashboardQueryStatus = 'loading' | 'idle' | 'success' | 'error';

const dashboardQueryStatusAtom = atom<DashboardQueryStatus>('idle');

export const useDashboardQueryStatus = () =>
    useAtomValue(dashboardQueryStatusAtom);

export const useSetDashboardQueryStatus = () =>
    useSetAtom(dashboardQueryStatusAtom);
