import { useLocalize } from '~/i18n/I18nContext';
import { LocaleToggle } from '~/layout/LocaleToggle';
import { ThemeToggle } from '~/layout/ThemeToggle';
import type { PropsWithChildren } from 'react';

export function SettingsPage() {
    const localize = useLocalize();
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                padding: 'var(--spacing-xl) 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xl)',
            }}
        >
            <h1 style={{ font: 'var(--display-font-md-regular)' }}>
                {localize('settings.settingsPage.title')}
            </h1>
            <SettingsGroup
                title={localize('settings.settingsPage.appSettingsLabel')}
            >
                <ThemeToggle />
                <LocaleToggle />
            </SettingsGroup>
        </div>
    );
}

type SettingsGroupProps = PropsWithChildren<{ title: string }>;
function SettingsGroup({ children, title }: SettingsGroupProps) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xl)',
            }}
        >
            <h3 style={{ font: 'var(--display-font-xs-regular)' }}>{title}</h3>
            {children}
        </div>
    );
}
