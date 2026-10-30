import { ViewFilterFactory } from '~/filters/factory';
import { PeriodType } from '~/filters/filters';
import { useLocalize } from '~/i18n/I18nContext';
import { useDashboardContext } from '../../context/dashboardContextValue';
import type { Period } from '../EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers.ts';
import {
    getTimePeriodLabel,
    getTimeRangeTypeLabel,
    isActiveInPeriodPreset,
} from './dateFilterUtils.ts';
import { PredefinedDateFilterButton } from './PredefinedDateFilterButton';

interface TimePeriodFilterProps {
    timePeriod: Period;
    type: 'this' | 'next' | 'last';
}

export function TimePeriodFilter({ timePeriod, type }: TimePeriodFilterProps) {
    const localize = useLocalize();
    const { globalDateFilter } = useDashboardContext();

    const label = `${getTimeRangeTypeLabel(type, localize)} ${getTimePeriodLabel(timePeriod, localize)}`;
    const periodOffset = type === 'this' ? 0 : type === 'next' ? 1 : -1;

    const isActive = isActiveInPeriodPreset(
        globalDateFilter,
        timePeriod,
        periodOffset
    );

    return (
        <PredefinedDateFilterButton
            label={label}
            isActive={isActive}
            buildFilter={() =>
                ViewFilterFactory.fromDateValue({
                    type: 'date',
                    condition: 'in_period',
                    period: timePeriod,
                    [PeriodType.fromTypeName(timePeriod).offsetName]:
                        periodOffset,
                    preset: `${type}_${timePeriod}`,
                })
            }
        />
    );
}
