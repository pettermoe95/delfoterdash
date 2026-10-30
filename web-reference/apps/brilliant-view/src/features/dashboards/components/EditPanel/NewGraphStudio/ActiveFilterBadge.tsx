import { Chip } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

export default function ActiveFilterBadge() {
    const localize = useLocalize();
    return (
        <Chip
            text={localize('dashboards.options.filtersActive')}
            size={'xs'}
            color={'brand'}
            className={'h-5 rounded'}
        />
    );
}
