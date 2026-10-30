import { Avatar, Button, cn, IconButton } from '@brilliant/bds-core';
import { useIsMobile } from '@brilliant/components';
import { getAvatarUrl } from '@bv/ui';
import {
    useDashboardContext,
    useDashboardData,
    useDashboardParams,
} from '~/features/dashboards';
import { useDashboardEditPermission } from '~/features/dashboards/hooks/useDashboardEditPermission';
import { useLocalize } from '~/i18n/I18nContext';
import { APP_ROUTES } from '~/routes/routes';
import { useGlobalLayoutMatch, useLayoutBackground } from '~/stores/system';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardMenu } from '../DashboardMenu';
import { EditableDashboardIcon, EditableDashboardName } from '../Forms';
import { DashboardHeaderProvider } from './dashboardHeaderContext';
import { LoadingIndicator } from './LoadingIndicator';

export function DashboardHeader() {
    const localize = useLocalize();
    const { editMode } = useDashboardContext();
    const dashboardQuery = useDashboardData();
    const { resetParams, setDashboardParams } = useDashboardParams();
    const dashboard = dashboardQuery.data;
    const { canEditDashboard } = useDashboardEditPermission(dashboard);

    const isFullscreen = useGlobalLayoutMatch('fullscreen');
    const backgroundClass = useLayoutBackground();

    const { ref, isSticky } = useSticky();
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    function toggleEditMode() {
        if (editMode) return resetParams();
        setDashboardParams({ editMode: 'true' });
    }

    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1024); // Tailwind `md` breakpoint
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (!dashboard || isFullscreen) return null;

    return (
        <DashboardHeaderProvider value={{ isSticky }}>
            <header
                ref={ref}
                className={cn(
                    'flex items-center justify-between px-3 lg:px-4xl',
                    'top-0 z-10 w-full bg-secondary py-md',
                    isLargeScreen ? 'sticky' : 'fixed',
                    isSticky && 'border-secondary drop-shadow-md dark:border-b',
                    backgroundClass
                )}
            >
                <div
                    className={cn(
                        'flex items-center justify-between gap-xl',
                        editMode && 'pl-6'
                    )}
                >
                    <BackButton editMode={editMode} />
                    <EditableDashboardIcon dashboard={dashboard} />
                    <EditableDashboardName dashboard={dashboard} />
                    <DashboardMenu />
                    <LoadingIndicator />
                </div>
                <div className="flex items-center gap-3xl">
                    <DashboardAvatar />
                    {canEditDashboard && (
                        <div className="hidden lg:block">
                            <Button
                                leftIcon={editMode ? 'bv:close' : 'bv:pen'}
                                variant="outlined"
                                color={editMode ? 'error' : 'primary'}
                                size={isSticky ? 'sm' : 'md'}
                                onClick={toggleEditMode}
                            >
                                {editMode
                                    ? localize(
                                          'dashboards.create.leaveEditMode'
                                      )
                                    : localize('miscTerms.edit')}
                            </Button>
                        </div>
                    )}
                </div>
            </header>
        </DashboardHeaderProvider>
    );
}

function DashboardAvatar() {
    const dashboardQuery = useDashboardData();
    const dashboard = dashboardQuery.data;
    if (!dashboard?.created_by) return null;

    const url = getAvatarUrl(dashboard.created_by);
    const fullName = [
        dashboard.created_by.first_name,
        dashboard.created_by.last_name,
    ].join(' ');

    return (
        <Avatar
            name={fullName}
            src={url}
            size="sm"
            title={`Owner: ${fullName}`}
        />
    );
}

function BackButton({ editMode }: { editMode: boolean }) {
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    if (editMode) return null;
    return (
        <IconButton
            icon="bv:arrow-left"
            variant="ghost"
            color="gray"
            size={isMobile ? 'xs' : 'md'}
            onClick={() => navigate(APP_ROUTES.dashboardsOverview)}
        />
    );
}

function useSticky() {
    const ref = useRef<HTMLDivElement>(null);

    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const observer = new IntersectionObserver(
            ([event]) => setIsSticky(event.intersectionRatio < 1),
            { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
        );
        observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    return { ref, isSticky };
}
