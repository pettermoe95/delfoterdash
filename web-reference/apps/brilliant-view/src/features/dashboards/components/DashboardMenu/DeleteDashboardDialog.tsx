import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@brilliant/bds-core';
import type { Dashboard } from '@bv/api';
import { useDeleteDashboard } from '~/features/dashboards/mutations';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';

type DeleteDashboardModalProps = {
    dashboard: Dashboard;
    onDelete?: () => void;
};

export function DeleteDashboardModal({
    dashboard,
    onDelete,
}: DeleteDashboardModalProps) {
    const localize = useLocalize();
    const deleteMutation = useDeleteDashboard(dashboard, false);
    const [isOpen, setIsOpen] = useState(false);

    function handleDeleteDashboard() {
        deleteMutation
            .mutateAsync()
            .then(() => {
                setIsOpen(false);
                onDelete?.();
            })
            .catch((err) => console.error('Failed to delete dashboard', err));
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button color="error" size="sm" leftIcon="bv:trash">
                    {localize('miscTerms.delete')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <div className="mt-4">
                    <DialogTitle
                        titleIconColor="red"
                        titleIconName="bv:alert-circle"
                    >
                        {localize('dashboards.delete.deleteQuestion')}
                    </DialogTitle>
                </div>
                <DialogDescription>
                    {localize('dashboards.delete.deleteWarning1')}{' '}
                    {dashboard.name}.{' '}
                    {localize('dashboards.delete.deleteWarning2')}
                </DialogDescription>
                <DialogFooter>
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            size="sm"
                            color="gray"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                        >
                            {localize('miscTerms.cancel')}
                        </Button>
                        <Button
                            color="error"
                            size="sm"
                            leftIcon={'bv:trash'}
                            onClick={handleDeleteDashboard}
                        >
                            {localize('dashboards.delete.deleteDashboard')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
