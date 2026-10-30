import { Button } from '@brilliant/bds-core';
import { CellContent } from '@bv/ui';
import type { CellContext } from '@tanstack/react-table';
import type { CredentialListItem } from '~/features/workflows/api/types';
import { useCredentialDetailQuery } from '~/features/workflows/hooks/useCredentialDetailQuery';
import { useCredentialReAuthorizationQuery } from '~/features/workflows/hooks/useCredentialReAuthorizationQuery';
import { useLocalize } from '~/i18n/I18nContext';
import {
    buildCredentialReAuthorizationUrl,
    getAuthorizationUrlValue,
    getClientIdValue,
    redirectToReAuthorization,
} from '../../../utils/credentialReAuthorization';

export function AuthorizedCredentialCell(
    cell: CellContext<CredentialListItem, unknown>
) {
    const localize = useLocalize();
    const credential = cell.row.original;
    const {
        data: reAuthorization,
        isError,
        isReAuthorizationSupported,
    } = useCredentialReAuthorizationQuery(credential.id, credential.flow_name);
    const needsReAuth = reAuthorization?.needsReAuth === true;
    const { data: credentialDetail, isFetching: isCredentialDetailLoading } =
        useCredentialDetailQuery(credential.id, {
            enabled: isReAuthorizationSupported && needsReAuth,
        });

    if (!isReAuthorizationSupported) {
        return <CellContent>-</CellContent>;
    }

    if (isError) {
        return <CellContent>{localize('genericError')}</CellContent>;
    }

    if (reAuthorization) {
        const configuration = credentialDetail?.configuration;
        const authorizationUrl = configuration
            ? getAuthorizationUrlValue(configuration)
            : null;
        const clientId = configuration ? getClientIdValue(configuration) : null;
        const redirectUrl =
            authorizationUrl && clientId
                ? buildCredentialReAuthorizationUrl(
                      authorizationUrl,
                      clientId,
                      credential.id
                  )
                : null;
        return (
            <CellContent>
                <div className="flex items-center">
                    {needsReAuth ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={isCredentialDetailLoading || !redirectUrl}
                            onClick={() =>
                                redirectUrl &&
                                redirectToReAuthorization(redirectUrl)
                            }
                        >
                            {localize('workflows.authorizeCredential')}
                        </Button>
                    ) : (
                        '-'
                    )}
                </div>
            </CellContent>
        );
    }

    return <CellContent>-</CellContent>;
}
