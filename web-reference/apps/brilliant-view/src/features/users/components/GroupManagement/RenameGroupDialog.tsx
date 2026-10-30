import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    TextField,
} from '@brilliant/bds-core';
import { useToastContext } from '@bv/ui';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect, useState } from 'react';
import type { GroupItem } from '../../api/schema';
import { getGroupErrorMessage, useRenameGroup } from '../../hooks/useGroups';

export default function RenameGroupDialog({
    group,
    open,
    onOpenChange,
}: {
    group: GroupItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const localize = useLocalize();
    const { displayToast } = useToastContext();
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const renameGroupMutation = useRenameGroup();

    const isManageableGroup = group !== null && !group.system_group;

    useEffect(() => {
        if (!open) return;

        setName(group?.name ?? '');
        setError(null);
    }, [group?.id, group?.name, open]);

    const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        if (!event.target.value.trim()) {
            setError(localize('users.groupsNameRequired'));
        } else {
            setError(null);
        }
    };

    const handleRename = async () => {
        if (!isManageableGroup) {
            return;
        }

        const nextName = name.trim();
        if (!nextName) {
            setError(localize('users.groupsNameRequired'));
            return;
        }

        if (nextName === group.name) {
            onOpenChange(false);
            return;
        }

        setError(null);

        try {
            await renameGroupMutation.mutateAsync({
                groupId: group.id,
                name: nextName,
            });
            onOpenChange(false);
        } catch (error) {
            displayToast({
                type: 'error',
                text: getGroupErrorMessage(error) ?? localize('genericError'),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="left-1/2 top-1/2 w-[calc(100vw-32px)] max-w-[560px] lg:min-w-0 xl:left-1/2">
                <DialogHeader>
                    <DialogTitle>{localize('users.renameGroup')}</DialogTitle>
                </DialogHeader>
                {isManageableGroup ? (
                    <div className="space-y-md">
                        <TextField
                            name="rename-group-name"
                            label={localize('users.groupName')}
                            value={name}
                            onChange={updateName}
                            error={error !== null}
                            supportingText={error ?? undefined}
                        />
                    </div>
                ) : (
                    <p className="text-sm text-secondary">
                        {localize('users.groupUnavailable')}
                    </p>
                )}
                <DialogFooter className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-end sm:space-x-0">
                    <Button
                        type="button"
                        variant="ghost"
                        color="gray"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        {localize('miscTerms.cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={!isManageableGroup || error !== null}
                        isLoading={renameGroupMutation.isPending}
                        onClick={() => void handleRename()}
                    >
                        {localize('miscTerms.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
