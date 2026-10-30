import type { Dashboard } from '@bv/api';

export type BaseEditableDashboardProps = {
    dashboard: Dashboard;
    onClose?: () => void;
};
