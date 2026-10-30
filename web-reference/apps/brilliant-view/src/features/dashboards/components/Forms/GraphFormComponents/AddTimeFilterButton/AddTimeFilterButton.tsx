import { Button, Icon } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

type AddTimeFilterButtonProps = {
    isShowingTimeFilter: boolean;
    // Accept boolean OR functional updater for robust toggling
    setIsShowingTimeFilter: () => void;
    disabled?: boolean;
};

export function AddTimeFilterButton({
    isShowingTimeFilter,
    setIsShowingTimeFilter,
    disabled = false,
}: AddTimeFilterButtonProps) {
    const localize = useLocalize();
    const toggleShowTimeFilter = () => {
        setIsShowingTimeFilter();
    };

    return isShowingTimeFilter ? (
        <Button
            variant="outlined"
            color="secondary"
            className="button-tertiary-gray-bg"
            size="sm"
            onClick={toggleShowTimeFilter}
            disabled={disabled}
        >
            <Icon icon="bv:close" className="relative" />
        </Button>
    ) : (
        <Button
            leftIcon="bv:plus"
            variant="outlined"
            color="secondary"
            className="button-tertiary-gray-bg"
            size="sm"
            onClick={toggleShowTimeFilter}
            disabled={disabled}
        >
            {localize('dashboards.options.addTimeFilter')}
        </Button>
    );
}
