import { Icon } from '@brilliant/bds-core';
import clsx from 'clsx';
import { NavLink as RouterLink } from 'react-router-dom';
import styles from './NavLink.module.scss';
import type { NavLinkItem } from './types';

export const NavLink = ({ icon, href, target, text, onClick }: NavLinkItem) => {
    return (
        <RouterLink
            to={href}
            className={clsx(styles.NavigationItem)}
            target={target}
            onClick={() => {
                if (onClick) {
                    onClick();
                }
            }}
        >
            {icon && <Icon className={styles.NavigationItemIcon} icon={icon} />}
            <span>{text}</span>
        </RouterLink>
    );
};
