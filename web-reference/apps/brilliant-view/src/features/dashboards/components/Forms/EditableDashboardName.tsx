import type { Dashboard } from '@bv/api';
import { EditableTextField } from '~/features/utility/components/EditableTextField/EditableTextField';
import { useEffect } from 'react';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission';
import { useUpdateDashboard } from '../../mutations';
import { useHeaderContext } from '../Layout';
import type { DashboardMetaForm } from './dashboardMetaForm';
import { useDashboardMetaForm } from './dashboardMetaForm';

function useDashboardTitleFontClass() {
    const { isSticky } = useHeaderContext();
    return isSticky
        ? 'bv-display-font-xs-regular xl:bv-display-font-sm-regular'
        : 'bv-display-font-sm-regular xl:bv-display-font-md-regular';
}

export function EditableDashboardName({ dashboard }: { dashboard: Dashboard }) {
    const { canEditDashboard } = useDashboardEditPermission(dashboard);
    const form = useDashboardMetaForm(dashboard);
    const mutation = useUpdateDashboard(dashboard);
    const titleFontClass = useDashboardTitleFontClass();

    useEffect(() => {
        form.reset({
            ...form.getValues(),
            name: dashboard.name,
        });
    }, [dashboard.name, form]);

    async function handleSubmit(values: DashboardMetaForm) {
        try {
            await mutation.mutateAsync({ name: values.name });
            form.reset(values);
        } catch (err) {
            console.error(err);
        }
    }

    function handleCancel() {
        form.reset();
    }

    return (
        <EditableTextField
            control={form.control}
            inputText="name"
            placeholder="Dashboard name"
            headingClassName={titleFontClass}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            disabled={!canEditDashboard}
        />
    );
}
