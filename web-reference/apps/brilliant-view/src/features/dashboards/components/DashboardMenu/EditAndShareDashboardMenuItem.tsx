import { DropdownMenuItem, Icon } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

type EditAndShareDashboardMenuItemProps = {
    setIsModalOpen: (value: boolean) => void;
};

export function EditAndShareDashboardMenuItem({
    setIsModalOpen,
}: EditAndShareDashboardMenuItemProps) {
    const localize = useLocalize();
    return (
        <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
            <Icon icon="mdi:share-variant-outline" />
            <p>{localize('dashboards.editAndShare.menuItem')}</p>
        </DropdownMenuItem>
    );
}
