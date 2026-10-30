import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from '../../Theme';
import styles from './ButtonIcon.module.scss';

type ButtonIconProps = {
    icon?: string | ReactNode;
    isLoading?: boolean;
};
export function ButtonIcon({ icon, isLoading }: ButtonIconProps) {
    if (!icon) return null;
    if (typeof icon !== 'string') return icon;
    return (
        <span className="flex-shrink-0">
            <Icon
                className={clsx(
                    'Button-icon',
                    isLoading && styles['ButtonIcon--loading']
                )}
                name={icon}
                icon={isLoading ? 'bv:loading' : icon}
            />
        </span>
    );
}
