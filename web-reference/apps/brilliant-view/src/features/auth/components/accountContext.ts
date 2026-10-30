import type { AboutMeResponse, Account } from '@bv/api';
import { createContext, useContext } from 'react';

export type AccountContextValue = {
    account: Account | undefined;
    organization: AboutMeResponse['organization'] | undefined;
    impersonator: Account | null;
    hasPermission: (permission: string) => boolean;
};

const defaultAccountContextValue: AccountContextValue = {
    account: undefined,
    organization: undefined,
    impersonator: null,
    hasPermission: () => false,
};

export const AccountContext = createContext<AccountContextValue>(
    defaultAccountContextValue
);

export const useAccount = () => useContext(AccountContext);
