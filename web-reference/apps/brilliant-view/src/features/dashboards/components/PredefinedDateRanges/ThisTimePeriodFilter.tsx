import { DateInPeriodFilter, PeriodType } from '~/filters/filters';
import { useLocalize } from '~/i18n/I18nContext';
import { useDashboardContext } from '../../context/dashboardContextValue';
import type { Period } from '../EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers.ts';
import {
    getTimePeriodLabel,
    getTimeRangeTypeLabel,
    isActiveInPeriodPreset,
} from './dateFilterUtils.ts';
import { PredefinedDateFilterButton } from './PredefinedDateFilterButton';

interface ThisTimePeriodFilterProps {
    timePeriod: Period;
}

export function ThisTimePeriodFilter({
    timePeriod,
}: ThisTimePeriodFilterProps) {
    const localize = useLocalize();
    const { globalDateFilter } = useDashboardContext();
    const label = `${getTimeRangeTypeLabel('this', localize)} ${getTimePeriodLabel(timePeriod, localize)}`;
    const isActive = isActiveInPeriodPreset(globalDateFilter, timePeriod, 0);
    return (
        <PredefinedDateFilterButton
            label={label}
            isActive={isActive}
            buildFilter={() =>
                new DateInPeriodFilter(
                    PeriodType.fromTypeName(timePeriod),
                    0,
                    `this_${timePeriod}`
                )
            }
        />
    );
}
