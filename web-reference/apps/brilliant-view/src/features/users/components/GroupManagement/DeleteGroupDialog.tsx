import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Icon,
} from '@brilliant/bds-core';
import { useToastContext } from '@bv/ui';
import type { GroupItem } from '~/features/users/api/schema.ts';
import { useDeleteGroup } from '~/features/users/hooks/useGroups.tsx';
import { useLocalize } from '~/i18n/I18nContext';

export default function DeleteGroupDialog({
    group,
    open,
    onOpenChange,
}: {
    group: GroupItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const localize = useLocalize();
    const deleteGroupMutation = useDeleteGroup();
    const { displayToast } = useToastContext();
    const isManageableGroup = group !== null && !group.system_group;

    const handleDelete = async () => {
        if (!isManageableGroup) {
            return;
        }

        try {
            await deleteGroupMutation.mutateAsync(group.id);
            onOpenChange(false);
        } catch (error) {
            displayToast({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : localize('genericError'),
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="w-[calc(100vw-32px)] lg:min-w-[600px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <Icon
                            icon="mdi:alert-circle-outline"
                            className="h-6 w-6 rounded-full bg-brand-tertiary text-fg-error-primary"
                        />
                        <span>{localize('users.deleteGroupQuestion')}</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-x-1 text-left">
                        <span>{localize('users.deleteGroupWarning1')}</span>
                        <span className="font-medium">
                            {group?.name ?? localize('users.groupFallbackName')}
                        </span>
                        <span>{localize('users.deleteGroupWarning2')}</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        {localize('miscTerms.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        leftIcon="bv:trash"
                        onClick={() => void handleDelete()}
                        disabled={!isManageableGroup}
                    >
                        {localize('miscTerms.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
