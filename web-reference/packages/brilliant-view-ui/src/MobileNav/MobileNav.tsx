import { pickColorBasedOnTheme } from '@brilliant/components';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NavbarLogo } from './Logo/NavbarLogo';
import { MobileAccountCard } from './MobileAccountCard';
import type { NavbarContextValue } from './MobileNav.context';
import { NavbarProvider } from './MobileNav.context';
import type { NavLinkItem } from './NavLink';
import { NavLink } from './NavLink';

type MobileNavProps = Partial<NavbarContextValue> &
    PropsWithChildren<{
        logoSrc: string;
        navigation: {
            items: NavLinkItem[];
            secondaryItems?: NavLinkItem[];
        };
    }>;

export type MobileNavigationItems = MobileNavProps['navigation'];

export function MobileNav({
    navigation,
    logoSrc,
    account,
    handleLogOut,
}: MobileNavProps) {
    const location = useLocation();
    const currentLocation = location.pathname;
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const colorsBrand = pickColorBasedOnTheme('#ebf3ff', '#133669');

    const menuIconOpen = (
        <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 6C0 2.68629 2.68629 0 6 0H34C37.3137 0 40 2.68629 40 6V34C40 37.3137 37.3137 40 34 40H6C2.68629 40 0 37.3137 0 34V6Z"
                fill="bg-primary"
            />
            <path
                d="M11 14H29M11 26H29M11 20H25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
    const menuIconClose = (
        <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 6C0 2.68629 2.68629 0 6 0H34C37.3137 0 40 2.68629 40 6V34C40 37.3137 37.3137 40 34 40H6C2.68629 40 0 37.3137 0 34V6Z"
                fill={colorsBrand}
            />
            <path
                d="M24.8654 15.1346L25.3864 14.6136L24.8654 15.1346C24.9062 15.1755 24.9062 15.2417 24.8654 15.2825L20.6782 19.4697L20.1479 20L20.6782 20.5303L24.8654 24.7175C24.9062 24.7583 24.9062 24.8245 24.8654 24.8654C24.8245 24.9062 24.7583 24.9062 24.7175 24.8654L20.5303 20.6782L20 20.1479L19.4697 20.6782L15.2825 24.8654C15.2417 24.9062 15.1755 24.9062 15.1346 24.8654L14.6043 25.3957L15.1346 24.8654C15.0938 24.8245 15.0938 24.7583 15.1346 24.7175L14.6232 24.206L15.1346 24.7175L19.3218 20.5303L19.8521 20L19.3218 19.4697L15.1346 15.2825C15.0938 15.2417 15.0938 15.1755 15.1346 15.1346C15.1755 15.0938 15.2417 15.0938 15.2825 15.1346L19.4697 19.3218L20 19.8521L20.5303 19.3218L24.7175 15.1346C24.7583 15.0938 24.8245 15.0938 24.8654 15.1346Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );

    function handleMenuOpen() {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        } else if (!isMenuOpen) {
            setIsMenuOpen(true);
        }
    }

    function handleMenuClose() {
        setIsMenuOpen(false);
    }

    return (
        <div className="fixed z-50 w-full">
            <NavbarProvider value={{ currentLocation, account, handleLogOut }}>
                {isMenuOpen && (
                    <div className="fixed left-0 top-0 h-full w-full bg-primary">
                        <div
                            className="flex flex-col justify-between overflow-auto px-2 pt-4"
                            style={{ height: 'calc(100vh - 65px)' }}
                        >
                            <div className="pt-4">
                                <NavbarNavigationItems
                                    items={navigation.items}
                                    handleClose={handleMenuClose}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Bottom Navbar with Hamburger Button */}
                <div className="fixed bottom-0 left-0 w-full bg-primary px-2">
                    {isMenuOpen ? (
                        <div className="mb-2">
                            <div className="mb-4">
                                <NavbarNavigationItems
                                    items={navigation.secondaryItems}
                                    handleClose={handleMenuClose}
                                />
                            </div>
                            <MobileAccountCard />
                        </div>
                    ) : (
                        <div className="hidden"></div>
                    )}
                    <div className="flex items-center justify-between py-2">
                        <NavbarLogo src={logoSrc} />
                        <button onClick={handleMenuOpen} className="z-50">
                            {isMenuOpen ? menuIconClose : menuIconOpen}
                        </button>
                    </div>
                </div>
            </NavbarProvider>
        </div>
    );
}

type MobileNavigationItemsProps = {
    items?: NavLinkItem[];
    handleClose?: () => void;
};
function NavbarNavigationItems({
    items,
    handleClose,
}: MobileNavigationItemsProps) {
    if (!items) return null;

    return (
        <nav className="m-0 flex w-auto flex-col gap-md p-0">
            {items.map(({ text, href, ...rest }) => (
                <NavLink
                    key={text}
                    href={href}
                    text={text}
                    onClick={handleClose}
                    {...rest}
                />
            ))}
        </nav>
    );
}

MobileNav.NavLink = NavLink;
