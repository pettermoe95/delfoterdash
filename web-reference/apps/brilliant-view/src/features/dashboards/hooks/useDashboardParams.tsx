import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { EDIT_PANE_NAMES } from '../components/EditPanel/Panes/panes';

const searchParamsSchema = z
    .object({
        editMode: z.enum(['true', 'false']).optional(),
        editPane: z.enum(EDIT_PANE_NAMES).optional(),
        editGraphId: z.string().optional(),
        new: z.enum(['true', 'false']).optional(),
    })
    .catchall(z.string().optional());

export type DashboardSearchParams = z.infer<typeof searchParamsSchema>;

export function useDashboardParams() {
    const [rawParams, setSearchParams] = useSearchParams();

    const allParams = Object.fromEntries(rawParams.entries());

    const searchParams = searchParamsSchema.parse(allParams);

    const resetParams = () => {
        rawParams.delete('editMode');
        rawParams.delete('editPane');
        rawParams.delete('new');
        rawParams.delete('newGraph');
        setSearchParams(rawParams);
    };

    function resetPane() {
        rawParams.delete('editPane');
        rawParams.delete('editGraphId');
        rawParams.delete('newGraph');
        setSearchParams(rawParams);
    }

    const setDashboardParams = (params: Partial<DashboardSearchParams>) => {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) rawParams.set(key, value);
        });
        setSearchParams(rawParams);
    };

    return {
        searchParams,
        editMode: Boolean(searchParams.editMode),
        setDashboardParams,
        resetParams,
        resetPane,
    };
}
