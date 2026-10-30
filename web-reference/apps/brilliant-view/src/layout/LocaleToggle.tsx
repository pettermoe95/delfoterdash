import type { SelectOption } from '@brilliant/bds-core';
import { SingleSelect } from '@brilliant/bds-core';
import { Row } from '@brilliant/components';
import { useLocalize } from '~/i18n/I18nContext';
import type { LocaleKey } from '~/stores/system';
import { useGlobalLocale } from '~/stores/system';

export function LocaleToggle() {
    const [globalLocale, setGlobalLocale] = useGlobalLocale();
    const localize = useLocalize();
    const localeTabs = [
        {
            value: 'en',
            label: (
                <Row>
                    <span>{localize('settings.localeToggle.en')}</span>
                </Row>
            ),
        },
        {
            value: 'nb',
            label: (
                <Row>
                    <span>{localize('settings.localeToggle.nb')}</span>
                </Row>
            ),
        },
    ] satisfies SelectOption[];

    return (
        <Row width="200px">
            <SingleSelect
                label={localize('settings.localeToggle.label')}
                value={globalLocale}
                options={localeTabs}
                onChange={(value) => setGlobalLocale(value as LocaleKey)}
            />
        </Row>
    );
}
