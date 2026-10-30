import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    DropdownMenuItem,
    Icon,
} from '@brilliant/bds-core';
import type { Dashboard } from '@bv/api';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { useDeleteDashboard } from '../../mutations';

type DeleteDashboardMenuItemProps = {
    onClose?: () => void;
    dashboard: Dashboard;
    navigateOnDelete?: boolean;
};

export function DeleteDashboardMenuItem({
    dashboard,
    navigateOnDelete = true,
    onClose,
}: DeleteDashboardMenuItemProps) {
    const localize = useLocalize();
    const { hasPermission } = useAccount();
    const mutate = useDeleteDashboard(dashboard, navigateOnDelete);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            onClose?.();
        }
        setIsOpen(isOpen);
    };

    const handleDeleteDashboard = async () => {
        await mutate.mutateAsync();
        onClose?.();
    };

    if (!dashboard || !hasPermission(PERMISSION.DASHBOARDS_DELETE)) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger className="w-full">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Icon
                        icon="mdi:delete"
                        className="h-4 w-4 text-fg-error-primary"
                    />
                    <span className="text-error-primary">
                        {localize('miscTerms.delete')}
                    </span>
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100vw-32px)] lg:min-w-[600px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <Icon
                            icon="mdi:alert-circle-outline"
                            className="h-6 w-6 rounded-full bg-brand-tertiary text-fg-error-primary"
                        />
                        <span>
                            {localize('dashboards.delete.deleteQuestion')}
                        </span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-x-1 text-left">
                        <span>
                            {localize('dashboards.delete.deleteWarning1')}
                        </span>
                        <span className="font-medium">{dashboard.name}</span>.
                        <span>
                            {localize('dashboards.delete.deleteWarning2')}
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        leftIcon="bv:trash"
                        onClick={handleDeleteDashboard}
                    >
                        {localize('dashboards.delete.deleteDashboard')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
