import { Button } from '@brilliant/bds-core';
import type { ViewFilter } from '~/filters/viewFilter';
import { useDashboardContext } from '../../context/dashboardContextValue';

type PredefinedDateFilterButtonProps = {
    label: string;
    isActive: boolean;
    buildFilter: () => ViewFilter | null;
};

export function PredefinedDateFilterButton({
    label,
    isActive,
    buildFilter,
}: PredefinedDateFilterButtonProps) {
    const dashboardContext = useDashboardContext();

    const handleClick = () => {
        if (isActive) {
            dashboardContext.clearFilterValue('date');
        } else {
            const filter = buildFilter();
            if (!filter) return;
            dashboardContext.updateFilterValue(filter);
        }
    };

    return (
        <Button
            variant={isActive ? 'filled' : 'outlined'}
            color={isActive ? 'primary' : 'gray'}
            size="sm"
            onClick={handleClick}
        >
            {label}
        </Button>
    );
}
