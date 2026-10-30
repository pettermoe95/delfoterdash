import clsx from 'clsx';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import type { ThemeSpacing } from '../../../Theme/util';
import { getThemeSpacing } from '../../../Theme/util';
import styles from './TabBar.module.scss';
import { Column, Row } from '../../../Layout';

export type TabStyle = 'default' | 'independent';
export type TabOption<T> = Tab<T> | 'spacer';

export type Tab<T = unknown> = {
    key: string | number;
    label: string | ReactElement;
    disabled?: boolean;
    value?: T;

    // Unmanaged tab items enable us to inject
    // any elements (such as buttons/headers) into the TabBar
    // without them caring about the tab navigation
    unmanaged?: boolean;
};

export type TabBarProps<T> = {
    tabs: TabOption<T>[];
    selected: Tab<T>;
    gap?: ThemeSpacing;
    header?: ReactNode;
    paddingSides?: ThemeSpacing;
    paddingTop?: ThemeSpacing;
    vertical?: boolean;
    look?: TabStyle;
    onSetTab?: (tab: Tab<T>) => void;
};

/**
 * Default brilliant tab bar for navigation.
 * Supports both integrated and independent styles.
 *
 * Tab options can the Tab type to support selection/styling,
 * or the custom 'spacer' option string to space out elements.
 */
export function TabBar<T>({
    tabs,
    selected,
    gap = 's',
    header,
    paddingSides = 'none',
    paddingTop = 'none',
    look = 'default',
    vertical = false,
    onSetTab,
}: TabBarProps<T>) {
    const tabClass = clsx({
        [styles.tabBar]: true,
        [styles.vertical]: vertical,
        [styles.independent]: look === 'independent',
    });
    const verticalLeftPad = look === 'independent' ? 0 : getThemeSpacing('l');
    const padGapStyle: CSSProperties = {
        gap: getThemeSpacing(gap),
        paddingLeft: vertical ? verticalLeftPad : getThemeSpacing(paddingSides),
        paddingRight: vertical ? 0 : getThemeSpacing(paddingSides),
        paddingBottom: vertical ? getThemeSpacing(paddingTop) : 0,
        alignSelf: 'stretch',
        height: vertical ? '100%' : 'auto',
    };

    return (
        <Column className={tabClass} style={{ paddingTop: getThemeSpacing(paddingTop) }}>
            {header && <Row style={padGapStyle}>{header}</Row>}
            <div className={styles.innerTabContainer} style={{ ...padGapStyle }}>
                {tabs.map((tab: TabOption<T>, index: number) => {
                    if (tab === 'spacer') {
                        return <div key={-(index + 1)} style={{ flex: 1 }} />;
                    }
                    if (tab.unmanaged === true) {
                        return tab.label;
                    }
                    const isSelected = tab.key === selected.key;
                    return (
                        <button
                            key={tab.key}
                            className={clsx(styles.tabButton, isSelected && styles.selected)}
                            disabled={tab.disabled}
                            style={{ pointerEvents: tab.disabled ? 'none' : 'all' }}
                            onClick={() => onSetTab?.(tab)}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </Column>
    );
}
