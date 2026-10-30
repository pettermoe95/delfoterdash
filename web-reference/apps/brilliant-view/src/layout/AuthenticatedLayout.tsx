import { OverlayContainerProvider } from '@brilliant/bds-core';
import { cn } from '@bv/ui';
import { AccountProvider, LoginPage, useAuth } from '~/features/auth';
import { I18nProvider } from '~/i18n/I18nProvider';
import { useGlobalLayoutMatch, useLayoutConfig } from '~/stores/system';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppMobileNav } from './AppMobileNav';
import { AppSidebar } from './AppSidebar';
import { ImpersonationBanner } from './ImpersonationBanner';

/**
 * Default layout for most views with side panel, tab bars etc.
 */

export function AuthenticatedLayout() {
    const { isAuthenticated, isCheckingAuthentication } = useAuth();
    const { backgroundClass, layoutPadding, maxWidthClass } = useLayoutConfig();
    const isPageLayout = useGlobalLayoutMatch('page-layout');
    const [pageContent, setPageContent] = useState<HTMLDivElement | null>(null);

    if (isCheckingAuthentication) {
        return null;
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <AccountProvider>
            <I18nProvider>
                <div className="flex h-screen flex-col">
                    <div className="shrink-0">
                        <ImpersonationBanner />
                    </div>
                    <OverlayContainerProvider value={pageContent}>
                        <div
                            ref={setPageContent}
                            className="relative flex min-h-0 flex-1 overflow-hidden [transform:translateZ(0)]"
                        >
                            <div className="h-full lg:hidden">
                                <AppMobileNav />
                            </div>
                            <div className="flex">
                                <AppSidebar />
                            </div>
                            <div
                                className={cn(
                                    'flex h-full flex-1 flex-col gap-4xl',
                                    backgroundClass,
                                    layoutPadding?.vertical
                                )}
                            >
                                {isPageLayout ? (
                                    <Outlet />
                                ) : (
                                    <>
                                        <AppHeader />
                                        <main
                                            className={cn(
                                                'flex h-full flex-1 flex-col overflow-y-auto',
                                                '-mt-4 pt-4',
                                                maxWidthClass,
                                                layoutPadding?.horizontal
                                            )}
                                        >
                                            <Outlet />
                                        </main>
                                    </>
                                )}
                            </div>
                        </div>
                    </OverlayContainerProvider>
                </div>
            </I18nProvider>
        </AccountProvider>
    );
}
