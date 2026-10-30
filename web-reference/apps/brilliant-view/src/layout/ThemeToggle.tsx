import type { SelectOption } from '@brilliant/bds-core';
import { Icon, SingleSelect } from '@brilliant/bds-core';
import { Row } from '@brilliant/components';
import { useLocalize } from '~/i18n/I18nContext';
import type { GlobalThemeKey } from '~/stores/system';
import { useGlobalTheme } from '~/stores/system';

export function ThemeToggle() {
    const [globalTheme, setGlobalTheme] = useGlobalTheme();

    const localize = useLocalize();
    const themeTabs = [
        {
            value: 'light',
            label: (
                <Row>
                    <Icon icon="mdi:weather-sunny" />
                    <span>{localize('settings.themeToggle.light')}</span>
                </Row>
            ),
        },
        {
            value: 'dark',
            label: (
                <Row>
                    <Icon icon="mdi:weather-night" />
                    <span>{localize('settings.themeToggle.dark')}</span>
                </Row>
            ),
        },
        {
            value: 'system',
            label: (
                <Row>
                    <Icon icon="mdi:sun-moon-stars" />
                    <span>{localize('settings.themeToggle.system')}</span>
                </Row>
            ),
        },
    ] satisfies SelectOption[];

    return (
        <Row width="200px">
            <SingleSelect
                label={localize('settings.themeToggle.label')}
                value={globalTheme}
                options={themeTabs}
                onChange={(value) => setGlobalTheme(value as GlobalThemeKey)}
            />
        </Row>
    );
}
