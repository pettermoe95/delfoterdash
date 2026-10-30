import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../utils';
import { AccountCard } from './AccountCard';
import { SidebarLogo } from './Logo/Logo';
import type { NavLinkItem } from './NavLink';
import { NavLink } from './NavLink';
import type { SidebarContextValue } from './Sidebar.context';
import { SidebarProvider, useSidebarContext } from './Sidebar.context';
import styles from './Sidebar.module.scss';

type SidebarProps = Partial<SidebarContextValue> &
    PropsWithChildren<{
        logoSrc?: string;
        navigation: {
            items: NavLinkItem[];
            secondaryItems?: NavLinkItem[];
        };
    }>;

export type SidebarNavigationItems = SidebarProps['navigation'];

export function Sidebar({
    navigation,
    minified,
    logoSrc,
    account,
    handleLogOut,
}: SidebarProps) {
    const location = useLocation();
    const currentLocation = location.pathname;

    return (
        <SidebarProvider
            value={{ minified, currentLocation, account, handleLogOut }}
        >
            <div className="lg:flex lg:h-full">
                <aside
                    className={cn(
                        'hidden h-full flex-col gap-3xl bg-primary px-xl pb-3xl pt-4xl text-secondary transition-all lg:flex',
                        minified ? 'w-max' : 'w-[250px]'
                    )}
                >
                    <div className="flex flex-1 flex-col gap-3xl">
                        <SidebarLogo src={logoSrc} />
                        <SidebarNavigationItems items={navigation.items} />
                    </div>
                    <SidebarNavigationItems items={navigation.secondaryItems} />
                    <AccountCard />
                </aside>
            </div>
        </SidebarProvider>
    );
}

type SidebarNavigationItemsProps = {
    items?: NavLinkItem[];
};
function SidebarNavigationItems({ items }: SidebarNavigationItemsProps) {
    const { minified } = useSidebarContext();

    if (!items) return null;

    return (
        <nav
            data-componentname="sidebar-navigation-items"
            className={cn(
                'm-0 flex flex-col gap-md p-0',
                minified ? 'w-[40px]' : 'w-auto',
                styles.sidebarNavigationItems
            )}
        >
            {items.map(({ text, href, ...rest }) => (
                <NavLink key={text} href={href} text={text} {...rest} />
            ))}
        </nav>
    );
}

Sidebar.NavLink = NavLink;
