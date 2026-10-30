import { Column } from '@brilliant/components';
import type { DashboardLayoutItem } from '@bv/api';
import DarkLogo from '~/assets/viewlogo_blue.png';
import WhiteLogo from '~/assets/viewlogo_white.svg';
import { DashboardGraphProvider } from './dashboardGraphContext';
import { DashboardGraphHeader } from './DashboardGraphHeader';

type BusinessLogoGraphProps = {
    layout: DashboardLayoutItem;
    isLoading: boolean;
    error: unknown;
    hideMenu?: boolean;
    hasActiveFilters: boolean;
    editMode: boolean;
    activeTheme: string;
};

const HEADER_HEIGHT = '50px';

export function BusinessLogoGraph({
    layout,
    isLoading,
    error,
    hideMenu,
    hasActiveFilters,
    editMode,
    activeTheme,
}: BusinessLogoGraphProps) {
    const logoSrc = activeTheme === 'dark' ? WhiteLogo : DarkLogo;
    const graphPadding = '18px';

    return (
        <DashboardGraphProvider
            value={{
                layout,
                isLoading,
                error,
                hideMenu,
                hasActiveFilters,
            }}
        >
            <Column width="100%" height="100%" gap="none" justify="flex-start">
                <div
                    className="w-full flex-1 justify-between"
                    style={{
                        height: HEADER_HEIGHT,
                        maxHeight: HEADER_HEIGHT,
                    }}
                    data-component-name="BusinessLogoGraphHeader"
                >
                    {editMode && <DashboardGraphHeader />}
                </div>

                <div
                    className="flex items-center justify-center"
                    style={{
                        width: `calc(100% - ${graphPadding} * 2)`,
                        height: `calc(100% - ${graphPadding} * 2 - ${HEADER_HEIGHT})`,
                        marginTop: graphPadding,
                    }}
                    data-component-name="BusinessLogoGraphBody"
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${logoSrc})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    />
                </div>
            </Column>
        </DashboardGraphProvider>
    );
}
