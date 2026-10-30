import { DropdownMenuItem, Icon } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

export function DuplicateDashboardMenuItem({
    isPending,
    onDuplicate,
}: {
    isPending: boolean;
    onDuplicate: () => void;
}) {
    const localize = useLocalize();

    return (
        <DropdownMenuItem
            disabled={isPending}
            onSelect={(event) => {
                event.preventDefault();
                onDuplicate();
            }}
        >
            <Icon icon="mdi:content-copy" />
            <span>{localize('dashboards.duplicate.menuItem')}</span>
        </DropdownMenuItem>
    );
}
