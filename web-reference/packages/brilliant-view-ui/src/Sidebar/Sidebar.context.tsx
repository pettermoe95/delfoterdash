import { createSafeContext } from '@brilliant/bds-core';
import type { Account } from '@bv/api';

export type SidebarContextValue = {
    minified: boolean | undefined;
    currentLocation: string | undefined;
    setCurrentLocation?: (value: string) => void;
    account?: Account;
    handleLogOut?: () => void;
};
export const [SidebarProvider, useSidebarContext] =
    createSafeContext<SidebarContextValue>(
        'No sidebar component found in the tree'
    );
