import { ViewFilterFactory } from '~/filters/factory';
import { useLocalize } from '~/i18n/I18nContext';
import { useDashboardContext } from '../../context/dashboardContextValue';
import { isActiveDateRangePreset } from './dateFilterUtils.ts';
import { getLastMonthsRange, getNextMonthsRange } from './dateRanges.ts';
import { PredefinedDateFilterButton } from './PredefinedDateFilterButton.tsx';

interface NumberOfMonthsFilterProps {
    numberOfMonths: number;
    type: 'last' | 'next';
}

export function NumberOfMonthsFilter({
    numberOfMonths,
    type,
}: NumberOfMonthsFilterProps) {
    const localize = useLocalize();
    const { globalDateFilter } = useDashboardContext();
    const rangeGetter =
        type === 'next' ? getNextMonthsRange : getLastMonthsRange;
    const { from: startValue, to: endValue } = rangeGetter(numberOfMonths);

    const label =
        type === 'next'
            ? localize('time.period.nextMonths', { n: numberOfMonths })
            : localize('time.period.lastMonths', { n: numberOfMonths });

    const preset = `${type}_months_${numberOfMonths}`;

    const isActive = isActiveDateRangePreset(
        globalDateFilter,
        preset,
        startValue,
        endValue
    );

    return (
        <PredefinedDateFilterButton
            label={label}
            isActive={isActive}
            buildFilter={() =>
                ViewFilterFactory.fromDateValue({
                    from: startValue,
                    to: endValue,
                    preset,
                })
            }
        />
    );
}
