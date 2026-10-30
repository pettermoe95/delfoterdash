import { createSafeContext } from '@brilliant/bds-core';

type DashboardHeaderContext = {
    isSticky: boolean;
};

export const [DashboardHeaderProvider, useHeaderContext] =
    createSafeContext<DashboardHeaderContext>('DashboardHeader: Context error');
