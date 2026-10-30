import type { Dashboard } from '@bv/api';
import { useNavigate } from 'react-router-dom';
import { getDashboardPath } from '../../dashboardSharing';

export function useNavigateToDashboard() {
    const navigate = useNavigate();

    return (dashboard: Dashboard) => navigate(getDashboardPath(dashboard.id));
}
