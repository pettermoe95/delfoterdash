import { MobileNav } from '@bv/ui';
import DarkLogo from '~/assets/viewlogo_blue.png';
import WhiteLogo from '~/assets/viewlogo_white.svg';
import { useAccount, useAuth } from '~/features/auth';
import { useActiveTheme, useLayoutConfig } from '~/stores/system';
import { useNavigationItems } from '../AppSidebar/navigationItems';

export function AppMobileNav() {
    const { account } = useAccount();
    const { logOut } = useAuth();
    const activeTheme = useActiveTheme();
    const navigationItems = useNavigationItems();

    const { mobileNav } = useLayoutConfig();

    if (mobileNav.hide) return null;

    const logoSrc = () => {
        return activeTheme === 'dark' ? WhiteLogo : DarkLogo;
    };

    return (
        <MobileNav
            logoSrc={logoSrc()}
            navigation={navigationItems}
            account={account}
            handleLogOut={logOut}
        />
    );
}
