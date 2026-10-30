import { useParams } from 'react-router-dom';

export function useDashboardId() {
    const { id } = useParams();

    if (!id) {
        throw new Error('No dashboard :id in path');
    }
    return parseInt(id);
}
