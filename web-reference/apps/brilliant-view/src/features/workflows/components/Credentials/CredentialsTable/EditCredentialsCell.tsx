import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Icon,
    IconButton,
} from '@brilliant/bds-core';
import { CellContent, useToastContext } from '@bv/ui';
import type { CellContext } from '@tanstack/react-table';
import { PERMISSION, useAccount } from '~/features/auth';
import type { CredentialListItem } from '~/features/workflows/api/types';
import { useCredentialDetailQuery } from '~/features/workflows/hooks/useCredentialDetailQuery';
import { useLocalize } from '~/i18n/I18nContext';
import { useState } from 'react';
import { DeleteCredentialsMenuItem } from '../DeleteCredentialsMenuItem';
import { EditCredentialsDialog } from '../EditCredentialsDialog/EditCredentialsDialog';

export function EditCredentialsCell(
    cell: CellContext<CredentialListItem, unknown>
) {
    const { hasPermission } = useAccount();
    const localize = useLocalize();
    const credentialData = cell.row.original;
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const { displayToast } = useToastContext();
    const {
        data: credentialDetail,
        isFetching: isCredentialFetching,
        refetch: refetchCredential,
    } = useCredentialDetailQuery(credentialData.id, {
        enabled: false,
    });

    const initialValues = credentialDetail
        ? {
              name: credentialDetail.name,
              flowId: credentialDetail.flow.id,
              configuration: credentialDetail.configuration ?? {},
          }
        : undefined;

    async function handleOpenDropdownMenu() {
        setIsMenuOpen(false);
        const result = await refetchCredential();
        if (result.data) {
            setIsDialogOpen(true);
        }
    }

    return (
        <CellContent
            hierarchy="secondary"
            className="mr-2 flex items-center justify-end gap-2 bv-text-font-sm-regular hover:cursor-pointer"
        >
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger
                    asChild
                    className={`${!hasPermission(PERMISSION.CREDENTIAL_MANAGE) ? 'hidden' : 'block'} p-2`}
                    disabled={!hasPermission(PERMISSION.CREDENTIAL_MANAGE)}
                >
                    <IconButton
                        icon="bv:dots-horizontal"
                        variant="ghost"
                        size="sm"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onSelect={handleOpenDropdownMenu}
                        disabled={!hasPermission(PERMISSION.CREDENTIAL_MANAGE)}
                    >
                        <Icon icon="bv:pen" />
                        {localize('workflows.editCredentials')}
                    </DropdownMenuItem>
                    <DeleteCredentialsMenuItem
                        credentialId={credentialData.id}
                        credentialName={credentialData.name}
                        onClose={() => setIsMenuOpen(false)}
                        onSuccess={() =>
                            displayToast({
                                type: 'success',
                                text: localize('workflows.credentialsDeleted'),
                            })
                        }
                        onError={() =>
                            displayToast({
                                type: 'error',
                                text: localize(
                                    'workflows.credentialsDeleteFailed'
                                ),
                            })
                        }
                    />
                </DropdownMenuContent>
            </DropdownMenu>
            <EditCredentialsDialog
                mode="edit"
                credentialId={credentialData.id}
                disabled={!credentialDetail}
                isLoadingInitialValues={isCredentialFetching}
                initialValues={initialValues}
                isDialogOpen={isDialogOpen}
                onOpenDialogChange={setIsDialogOpen}
                showTrigger={false}
            />
        </CellContent>
    );
}
