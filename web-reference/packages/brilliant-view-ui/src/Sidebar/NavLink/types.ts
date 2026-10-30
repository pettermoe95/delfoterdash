export type BaseNavLinkItem = {
    icon: string;
    text: string;
    href: string;
    exact?: boolean;
    minified?: boolean;
    target?: string;
};

export type NavLinkItem = BaseNavLinkItem & {
    items?: BaseNavLinkItem[];
};
