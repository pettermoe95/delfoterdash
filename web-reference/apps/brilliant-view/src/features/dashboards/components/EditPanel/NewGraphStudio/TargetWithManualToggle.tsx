import type { SelectOption } from '@brilliant/bds-core';
import { Checkbox, TextField } from '@brilliant/bds-core';
import type { ConceptSeries, ExtensiveDashboardConceptMetric } from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';
import { MetricWithFilter } from './MetricWithFilter';
import { buildManualTargetDisplay } from './Utils/commonFormHelpers';
import type { DisplayTarget } from './Utils/targetUtils';
import {
    getManualTargetDisplayObject,
    isTargetConcept,
} from './Utils/targetUtils';

type TargetWithManualToggleProps = {
    metricOptions: SelectOption[];
    periodOptions: SelectOption[];
    metrics: ExtensiveDashboardConceptMetric[];
    displayTarget: DisplayTarget;
    targetConcept: ConceptSeries;
    conceptForMeasurement: string;
    isShowingTimeFilter: boolean;
    setIsShowingTimeFilter?: () => void;
    onTargetConceptChange: (concept: ConceptSeries) => void;
    onDisplayTargetChange: (displayTarget: DisplayTarget) => void;
    calculationIndex: number;
    checkboxPosition?: 'before' | 'after';
    checkboxContainerClassName?: string;
    showDisabledMetricWhenManual?: boolean;
};

export function TargetWithManualToggle({
    metricOptions,
    periodOptions,
    metrics,
    displayTarget,
    targetConcept,
    conceptForMeasurement,
    isShowingTimeFilter,
    setIsShowingTimeFilter,
    onTargetConceptChange,
    onDisplayTargetChange,
    calculationIndex,
    checkboxPosition = 'after',
    checkboxContainerClassName = 'flex justify-start border-primary bg-primary py-sm text-secondary',
    showDisabledMetricWhenManual = true,
}: TargetWithManualToggleProps) {
    const localize = useLocalize();
    const isTarget = isTargetConcept(displayTarget);
    const isManualTarget = !isTarget;
    const manualTargetValue = isTarget
        ? '0'
        : String(displayTarget.target ?? 0);

    const checkbox = (
        <div className={checkboxContainerClassName}>
            <Checkbox
                id={'goal'}
                size="sm"
                text={localize('dashboards.options.goalValueManual')}
                checked={isManualTarget}
                onCheckedChange={(checked) =>
                    onDisplayTargetChange(
                        buildManualTargetDisplay(checked === true, {
                            calculationIndex,
                        })
                    )
                }
            />
        </div>
    );

    const manualInput = (
        <div className="flex flex-col gap-md">
            <TextField
                size="sm"
                placeholder={localize('dashboards.options.goalValueEnter')}
                name="target"
                autoComplete="off"
                type="number"
                value={manualTargetValue}
                onChange={(manualTarget) => {
                    onDisplayTargetChange(
                        getManualTargetDisplayObject(
                            manualTarget.target.value,
                            conceptForMeasurement,
                            metrics
                        )
                    );
                }}
            />
            {showDisabledMetricWhenManual && (
                <MetricWithFilter
                    metricOptions={metricOptions}
                    periodOptions={periodOptions}
                    isShowingTimeFilter={isShowingTimeFilter}
                    setIsShowingTimeFilter={setIsShowingTimeFilter}
                    isDisabled={true}
                    concept={targetConcept}
                    setMetric={onTargetConceptChange}
                />
            )}
        </div>
    );

    const conceptInput = (
        <MetricWithFilter
            metricOptions={metricOptions}
            periodOptions={periodOptions}
            isShowingTimeFilter={isShowingTimeFilter}
            setIsShowingTimeFilter={setIsShowingTimeFilter}
            concept={targetConcept}
            setMetric={onTargetConceptChange}
        />
    );

    return (
        <>
            {checkboxPosition === 'before' && checkbox}
            {isManualTarget ? manualInput : conceptInput}
            {checkboxPosition === 'after' && checkbox}
        </>
    );
}
