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
    Button,
    Icon,
} from '@brilliant/bds-core';
import type { DashboardLayoutItem } from '@bv/api';
import { useDeleteGraph } from '~/api/mutations/graph';
import { getDisplayGraphName } from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/textHelpers';
import { useMetricConcepts } from '~/hooks';
import { useLocalize } from '~/i18n/I18nContext';
import type { ReactNode } from 'react';
import { useState } from 'react';

type DeleteDashboardModalProps = {
    layout: DashboardLayoutItem;
    onDropdownChange?: () => void;
    trigger?: ReactNode | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function DeleteGraphDialog({
    layout,
    onDropdownChange,
    trigger,
    open,
    onOpenChange,
}: DeleteDashboardModalProps) {
    const localize = useLocalize();
    const { data: metrics } = useMetricConcepts();
    const graphTitle = getDisplayGraphName({
        name: layout.graph.name,
        query: layout.graph.query,
        metrics,
        localize,
    });
    const deleteGraph = useDeleteGraph();
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = open ?? uncontrolledOpen;
    const setIsOpen = onOpenChange ?? setUncontrolledOpen;

    function handleDeleteGraph() {
        deleteGraph
            .mutateAsync(layout)
            .then(() => {
                setIsOpen(false);
                onDropdownChange?.();
            })
            .catch((err) =>
                console.error('Failed to delete graph component', err)
            );
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger === null ? null : (
                <AlertDialogTrigger asChild>
                    {trigger ?? (
                        <Button
                            className="w-full"
                            color="error"
                            variant="outlined"
                            leftIcon="bv:trash"
                            size="sm"
                            type="button"
                        >
                            {localize('dashboards.delete.deleteComponent')}
                        </Button>
                    )}
                </AlertDialogTrigger>
            )}
            <AlertDialogContent className="w-[calc(100vw-32px)] lg:min-w-[600px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <Icon
                            icon="mdi:alert-circle-outline"
                            className="h-6 w-6 rounded-full bg-brand-tertiary text-fg-error-primary"
                        />
                        <span>
                            {localize(
                                'dashboards.delete.deleteComponentQuestion'
                            )}
                        </span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-x-1 text-left">
                        <span>
                            {localize('dashboards.delete.deleteWarning1')}
                        </span>
                        <span className="font-medium">{graphTitle}</span>.
                        <span>
                            {localize(
                                'dashboards.delete.deleteComponentWarning'
                            )}
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsOpen(false)}>
                        {localize('miscTerms.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        leftIcon="bv:trash"
                        onClick={handleDeleteGraph}
                    >
                        {localize('dashboards.delete.deleteComponent')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
