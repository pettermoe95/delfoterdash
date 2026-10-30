import { ViewFilterFactory } from '~/filters/factory';
import { DateBetweenFilter } from '~/filters/filters';
import { useLocalize } from '~/i18n/I18nContext';
import { useDashboardContext } from '../../context/dashboardContextValue';
import { getLastMonthsRange } from './dateRanges.ts';
import { PredefinedDateFilterButton } from './PredefinedDateFilterButton';

interface LastMonthsFilterButtonProps {
    numberOfMonths: number;
}

export function LastMonthsFilterButton({
    numberOfMonths,
}: LastMonthsFilterButtonProps) {
    const localize = useLocalize();
    const { globalDateFilter } = useDashboardContext();
    const { from: startValue, to: endValue } =
        getLastMonthsRange(numberOfMonths);
    const label =
        numberOfMonths > 1
            ? localize('time.period.lastMonths', { n: numberOfMonths })
            : localize('time.period.last30Days');

    const isActive =
        globalDateFilter instanceof DateBetweenFilter &&
        globalDateFilter.preset === `last_months_${numberOfMonths}`;

    return (
        <PredefinedDateFilterButton
            label={label}
            isActive={isActive}
            buildFilter={() =>
                ViewFilterFactory.fromDateValue({
                    from: startValue,
                    to: endValue,
                    preset: `last_months_${numberOfMonths}`,
                })
            }
        />
    );
}
