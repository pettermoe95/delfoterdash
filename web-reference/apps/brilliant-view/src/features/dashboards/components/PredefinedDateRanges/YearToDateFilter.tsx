import { ViewFilterFactory } from '~/filters/factory';
import { useLocalize } from '~/i18n/I18nContext';
import { useDashboardContext } from '../../context/dashboardContextValue';
import { isActiveDateRangePreset } from './dateFilterUtils.ts';
import { getYTDRange } from './dateRanges.ts';
import { PredefinedDateFilterButton } from './PredefinedDateFilterButton';

export function YearToDateFilter() {
    const localize = useLocalize();
    const { globalDateFilter } = useDashboardContext();
    const { from: startValue, to: endValue } = getYTDRange();

    const isActive = isActiveDateRangePreset(
        globalDateFilter,
        'ytd',
        startValue,
        endValue
    );

    return (
        <PredefinedDateFilterButton
            label={localize('time.ytd')}
            isActive={isActive}
            buildFilter={() =>
                ViewFilterFactory.fromDateValue({
                    from: startValue,
                    to: endValue,
                    preset: 'ytd',
                })
            }
        />
    );
}
