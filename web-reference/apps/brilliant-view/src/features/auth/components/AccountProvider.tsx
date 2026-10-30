import type { AboutMeResponse } from '@bv/api';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '~/config/queryClient';
import { ACCOUNT_QUERY_KEY, getAccountQueryOptions } from '~/features/auth';
import { isUnauthorizedAccountError } from '~/features/auth/hooks';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { AccountContextValue } from './accountContext';
import { AccountContext } from './accountContext';

export function AccountProvider({ children }: PropsWithChildren) {
    const { data, error, isLoading } = useQuery(getAccountQueryOptions());

    const resolvedData = isUnauthorizedAccountError(error)
        ? undefined
        : (data ??
          queryClient.getQueryData<AboutMeResponse>(ACCOUNT_QUERY_KEY));

    const value = useMemo<AccountContextValue | null>(() => {
        if (!resolvedData && !error && !isLoading) return null;

        const account = resolvedData?.user;
        const organization = resolvedData?.organization;
        const impersonator = resolvedData?.impersonator ?? null;
        const permissions = resolvedData?.permissions ?? [];

        const permissionNames = new Set(
            permissions.map((permission) => permission.name)
        );

        const hasPermission = (permission: string) =>
            permissionNames.has(permission);

        return {
            account,
            organization,
            impersonator,
            hasPermission,
        };
    }, [resolvedData, error, isLoading]);
    if (value === null) return null;

    return (
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    );
}
