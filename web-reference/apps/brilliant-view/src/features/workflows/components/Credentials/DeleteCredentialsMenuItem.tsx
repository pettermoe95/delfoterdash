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
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { useDeleteCredential } from '../../hooks/useCredentialMutations';

type DeleteCredentialsMenuItemProps = {
    credentialId: string;
    credentialName?: string;
    onClose?: () => void;
    onSuccess?: () => void;
    onError?: () => void;
};

export function DeleteCredentialsMenuItem({
    credentialId,
    credentialName,
    onClose,
    onSuccess,
    onError,
}: DeleteCredentialsMenuItemProps) {
    const localize = useLocalize();
    const { hasPermission } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const deleteMutation = useDeleteCredential();

    if (!hasPermission(PERMISSION.CREDENTIAL_MANAGE)) return null;

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose?.();
        }
        setIsOpen(open);
    };

    const handleDelete = () => {
        deleteMutation.mutate(credentialId, {
            onSuccess: () => {
                onSuccess?.();
                onClose?.();
                setIsOpen(false);
            },
            onError: () => {
                onError?.();
            },
        });
    };

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
                            {localize(
                                'workflows.deleteCredentials.deleteQuestion'
                            )}
                        </span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-x-1 text-left">
                        <span>
                            {localize(
                                'workflows.deleteCredentials.deleteWarning1'
                            )}
                        </span>
                        <span className="font-medium">
                            {credentialName ??
                                localize(
                                    'workflows.deleteCredentials.defaultName'
                                )}
                        </span>
                        <span>.</span>
                        <span>
                            {localize(
                                'workflows.deleteCredentials.deleteWarning2'
                            )}
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>
                        {localize('miscTerms.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        leftIcon="bv:trash"
                        onClick={handleDelete}
                    >
                        {localize('miscTerms.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
