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
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { getGroupErrorMessage, useCreateGroup } from '../../hooks/useGroups';

export default function CreateGroupDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const localize = useLocalize();
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const createGroupMutation = useCreateGroup();
    const { displayToast } = useToastContext();

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setName('');
            setError(localize('users.groupsNameRequired'));
        }
        onOpenChange(nextOpen);
    };

    const nameChanged = (event: ChangeEvent<HTMLInputElement>): void => {
        setName(event.target.value);
        if (!event.target.value.trim()) {
            setError(localize('users.groupsNameRequired'));
        } else {
            setError(null);
        }
    };

    const handleCreate = async () => {
        const nextName = name.trim();
        if (!nextName) {
            setError(localize('users.groupsNameRequired'));
            return;
        }

        setError(null);

        try {
            await createGroupMutation.mutateAsync(nextName);
            handleOpenChange(false);
        } catch (error) {
            displayToast({
                type: 'error',
                text: getGroupErrorMessage(error) ?? localize('genericError'),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="left-1/2 top-1/2 w-[calc(100vw-32px)] max-w-[560px] lg:min-w-0 xl:left-1/2">
                <DialogHeader>
                    <DialogTitle>{localize('users.createGroup')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-md">
                    <TextField
                        name="create-group-name"
                        label={localize('users.groupName')}
                        value={name}
                        onChange={nameChanged}
                        placeholder={localize('users.newGroupPlaceholder')}
                        error={error !== null}
                        supportingText={error ?? undefined}
                    />
                </div>
                <DialogFooter className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-end sm:space-x-0">
                    <Button
                        type="button"
                        variant="ghost"
                        color="gray"
                        size="sm"
                        onClick={() => handleOpenChange(false)}
                    >
                        {localize('miscTerms.cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        isLoading={createGroupMutation.isPending}
                        onClick={() => void handleCreate()}
                        disabled={
                            createGroupMutation.isPending || error !== null
                        }
                    >
                        {localize('users.createGroup')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
