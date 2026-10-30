import { Sidebar } from '@bv/ui';
import LogoSquare from '~/assets/viewlogo_blue_64x64.png';
import DarkLogo from '~/assets/viewlogo_blue.png';
import WhiteLogo from '~/assets/viewlogo_white.svg';
import { useAccount, useAuth } from '~/features/auth';
import { useActiveTheme, useLayoutConfig } from '~/stores/system';
import { useNavigationItems } from './navigationItems';

export function AppSidebar() {
    const { account } = useAccount();
    const { logOut } = useAuth();
    const activeTheme = useActiveTheme();
    const navigationItems = useNavigationItems();

    const { sidebar } = useLayoutConfig();

    if (sidebar.hide) return null;

    const logoSrc = () => {
        if (sidebar.minify) {
            return LogoSquare;
        }
        return activeTheme === 'dark' ? WhiteLogo : DarkLogo;
    };

    return (
        <Sidebar
            logoSrc={logoSrc()}
            navigation={navigationItems}
            minified={sidebar.minify}
            account={account}
            handleLogOut={logOut}
        />
    );
}
