import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import styles from './Page.module.scss';
import type { ThemeSpacing } from '../../Theme/util';
import { getThemeSpacing } from '../../Theme/util';

// ===================================== //
//             Standard Page             //
// ===================================== //

type PageProps = {
    scroll?: boolean;
    contentWidth?: string;
    sidePadding?: ThemeSpacing;
    bottomPadding?: ThemeSpacing;
    children?: ReactNode;
};

export function Page({
    scroll = true,
    sidePadding = 'm',
    bottomPadding = 'm',
    contentWidth = '80em',
    children,
}: PageProps) {
    const pageClass = clsx(styles.page, {
        [styles.scroll]: scroll,
    });
    const pageStyle: CSSProperties = {
        paddingLeft: getThemeSpacing(sidePadding),
        paddingRight: getThemeSpacing(sidePadding),
        paddingBottom: getThemeSpacing(bottomPadding),
    };
    const contentStyle: CSSProperties = {
        width: contentWidth,
        maxWidth: '100%',
        flex: 1,
    };
    return (
        <div className={pageClass} style={pageStyle}>
            <div style={contentStyle}>{children}</div>
        </div>
    );
}
