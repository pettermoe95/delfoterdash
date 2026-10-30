import { Icon, Tooltip } from '@brilliant/bds-core';
import clsx from 'clsx';
import { NavLink as RouterLink } from 'react-router-dom';
import { useSidebarContext } from '../Sidebar.context';
import styles from './NavLink.module.scss';
import type { NavLinkItem } from './types';
import { isActive } from './utils';

export const NavLink = ({ icon, href, exact, target, text }: NavLinkItem) => {
    const { minified, currentLocation } = useSidebarContext();
    const active = isActive(currentLocation ?? 'NONE', href, exact);

    if (minified) {
        return (
            <Tooltip title={text} side="right">
                <RouterLink
                    to={href}
                    className={clsx(
                        styles.NavigationItem,
                        minified && styles['NavigationItem--minified'],
                        active && styles['NavigationItem--active']
                    )}
                    target={target}
                >
                    {icon && (
                        <Icon
                            className={styles.NavigationItemIcon}
                            icon={icon}
                        />
                    )}
                </RouterLink>
            </Tooltip>
        );
    }

    return (
        <RouterLink
            to={href}
            className={clsx(
                styles.NavigationItem,
                active && styles['NavigationItem--active']
            )}
            target={target}
        >
            {icon && <Icon className={styles.NavigationItemIcon} icon={icon} />}
            <span>{text}</span>
        </RouterLink>
    );
};
