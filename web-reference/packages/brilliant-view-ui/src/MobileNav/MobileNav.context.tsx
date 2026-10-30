import { createSafeContext } from '@brilliant/bds-core';
import type { Account } from '@bv/api';

export type NavbarContextValue = {
    currentLocation: string | undefined;
    setCurrentLocation?: (value: string) => void;
    account?: Account;
    handleLogOut?: () => void;
};
export const [NavbarProvider, useNavbarContext] =
    createSafeContext<NavbarContextValue>(
        'No navbar component found in the tree'
    );
