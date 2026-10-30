import type { SelectOption } from '@brilliant/bds-core';
import { SingleSelect } from '@brilliant/bds-core';
import type { ConceptSeries } from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';
import type { PropsWithChildren } from 'react';
import { AddTimeFilterButton } from '../../Forms/GraphFormComponents/AddTimeFilterButton/AddTimeFilterButton';
import {
    isTimePeriod,
    OFFSET_KEY_BY_PERIOD,
} from './Utils/offsetAndPeriodFilterHelpers';

interface MetricWithFilterProps {
    metricOptions: SelectOption[];
    periodOptions: SelectOption[];
    isShowingTimeFilter?: boolean;
    setIsShowingTimeFilter?: () => void;
    isDisabled?: boolean;
    concept: ConceptSeries;
    setMetric: (concept: ConceptSeries) => void;
}

export function MetricWithFilter({
    metricOptions,
    periodOptions,
    isShowingTimeFilter,
    setIsShowingTimeFilter,
    isDisabled = false,
    children,
    concept,
    setMetric,
}: MetricWithFilterProps & PropsWithChildren) {
    const localize = useLocalize();
    const offsetOptions: SelectOption[] = [
        { value: '0', label: localize('time.this') },
        { value: '-1', label: localize('time.last') },
    ];
    const showTimeFilter = Boolean(isShowingTimeFilter);
    const canToggleTimeFilter = typeof setIsShowingTimeFilter === 'function';

    const offsetKey = OFFSET_KEY_BY_PERIOD[concept.time_period];

    const handleConceptName = (name: ConceptSeries['concept_name']) =>
        setMetric({ ...concept, concept_name: name });

    const handleDeicticModifier = (
        modifier: ConceptSeries['deictic_modifier']
    ) => {
        setMetric({ ...concept, deictic_modifier: modifier });
    };

    const handleTimePeriod = (period: ConceptSeries['time_period']) => {
        setMetric({ ...concept, time_period: period });
    };

    return (
        <>
            <div className={isDisabled ? 'hidden' : 'flex items-center gap-md'}>
                {children}
                <SingleSelect
                    size="sm"
                    options={metricOptions}
                    value={concept.concept_name}
                    onChange={(metric: string) => {
                        handleConceptName(metric);
                    }}
                />
            </div>

            <div className="flex gap-md">
                {canToggleTimeFilter && (
                    <AddTimeFilterButton
                        isShowingTimeFilter={showTimeFilter}
                        setIsShowingTimeFilter={setIsShowingTimeFilter}
                        disabled={isDisabled}
                    />
                )}

                {showTimeFilter && (
                    <div className="flex w-full gap-md">
                        {offsetKey && (
                            <SingleSelect
                                size="sm"
                                options={offsetOptions}
                                value={String(concept.deictic_modifier)}
                                onChange={(mod) => {
                                    const modifier =
                                        typeof mod === 'number'
                                            ? mod
                                            : Number(mod);
                                    handleDeicticModifier(
                                        modifier === -1 ? -1 : 0
                                    );
                                }}
                                disabled={isDisabled}
                            />
                        )}
                        <SingleSelect
                            size="sm"
                            options={periodOptions}
                            value={concept.time_period}
                            onChange={(timePeriod: string) => {
                                if (isTimePeriod(timePeriod)) {
                                    handleTimePeriod(timePeriod);
                                }
                            }}
                            disabled={isDisabled}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
