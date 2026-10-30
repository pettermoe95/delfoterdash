import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@brilliant/bds-core';
import { useToastContext } from '@bv/ui';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { CredentialsForm } from '../CredentialsForm/CredentialsForm';

type EditCredentialsDialogProps = {
    mode: 'create' | 'edit';
    disabled: boolean;
    credentialId?: string;
    isLoadingInitialValues?: boolean;
    isDialogOpen?: boolean;
    onOpenDialogChange?: (open: boolean) => void;
    showTrigger?: boolean;
    initialValues?: {
        flowId: string;
        name?: string;
        configuration?: Record<string, string>;
    };
    onSuccess?: () => void;
};

export function EditCredentialsDialog({
    mode,
    disabled,
    credentialId,
    isLoadingInitialValues = false,
    isDialogOpen,
    onOpenDialogChange,
    showTrigger = true,
    initialValues,
    onSuccess,
}: EditCredentialsDialogProps) {
    const [open, setOpen] = useState(false);
    const localize = useLocalize();
    const { displayToast } = useToastContext();
    const resolvedOpen = isDialogOpen ?? open;
    const handleOpenChange = onOpenDialogChange ?? setOpen;

    return (
        <>
            <Dialog open={resolvedOpen} onOpenChange={handleOpenChange}>
                {showTrigger && (
                    <DialogTrigger asChild>
                        <Button
                            style={{ float: 'right' }}
                            size="sm"
                            leftIcon="bv:plus"
                            disabled={disabled}
                        >
                            {mode === 'edit'
                                ? localize('workflows.editCredentials')
                                : localize('workflows.addCredentials')}
                        </Button>
                    </DialogTrigger>
                )}
                <DialogContent className="left-1/2 top-1/2 w-[calc(90vw-32px)] max-w-[600px] sm:max-w-[640px] lg:max-w-[696px]">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === 'edit'
                                ? localize('workflows.editCredentials')
                                : localize('workflows.addCredentials')}
                        </DialogTitle>
                    </DialogHeader>
                    <CredentialsForm
                        mode={mode}
                        disabled={disabled}
                        credentialId={credentialId}
                        initialValues={initialValues}
                        isLoadingInitialValues={isLoadingInitialValues}
                        onSuccess={() => {
                            displayToast({
                                type: 'success',
                                text:
                                    mode === 'edit'
                                        ? localize(
                                              'workflows.credentialsUpdated'
                                          )
                                        : localize(
                                              'workflows.credentialsAdded'
                                          ),
                            });
                            onSuccess?.();
                        }}
                        onError={() => {
                            displayToast({
                                type: 'error',
                                text:
                                    mode === 'edit'
                                        ? localize(
                                              'workflows.credentialsUpdateFailed'
                                          )
                                        : localize(
                                              'workflows.credentialsAddFailed'
                                          ),
                            });
                        }}
                        onClose={() => handleOpenChange(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
