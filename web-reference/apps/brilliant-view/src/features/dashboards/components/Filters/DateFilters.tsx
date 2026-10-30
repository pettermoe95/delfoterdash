import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    IconButton,
} from '@brilliant/bds-core';
import type { DateValue } from '@react-types/calendar';
import { toStringArray } from '~/filters/factory';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData.ts';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission.ts';
import { useUpdateDisplayedTimeFilters } from '../../hooks/useUpdateDisplayedTimeFilters.ts';
import { DateFilterPicker } from '../DatePicker/DateFilterPicker';
import type { PresetKey } from '../PredefinedDateRanges/dateFilterUtils';
import {
    buildDefaultVisibility,
    buildVisibilityFromPresetValues,
    getEnabledPresets,
    PRESET_CONFIG,
} from '../PredefinedDateRanges/dateFilterUtils';
import { NumberOfMonthsFilter } from '../PredefinedDateRanges/NumberOfMonthsFilter';
import { TimePeriodFilter } from '../PredefinedDateRanges/TimePeriodFilter';
import { YearToDateFilter } from '../PredefinedDateRanges/YearToDateFilter';

interface RenderDateFilterProps {
    dateRange: { start: DateValue; end: DateValue } | null;
    onSelectDateRange: (start: DateValue | null, end: DateValue | null) => void;
}

const areStringArraysEqual = (first: string[], second: string[]) => {
    if (first.length !== second.length) return false;
    const firstSet = new Set(first);
    return second.every((value) => firstSet.has(value));
};

export function DateFilters({
    dateRange,
    onSelectDateRange,
}: RenderDateFilterProps) {
    const localize = useLocalize();
    const dashboardQuery = useDashboardData();
    const dashboard = dashboardQuery?.data;
    const { canEditDashboard } = useDashboardEditPermission(dashboard);
    const dashboardId = dashboardQuery?.data?.id;
    const dashboardDisplay = dashboardQuery?.data?.display ?? undefined;
    const [searchParams] = useSearchParams();
    const startValue = dateRange?.start?.toString();
    const endValue = dateRange?.end?.toString();
    const hasPreset = Boolean(searchParams.get('datePreset'));
    const isCustomActive = !!startValue && !!endValue && !hasPreset;
    const [presetVisibility, setPresetVisibility] = useState<
        Record<PresetKey, boolean>
    >(buildDefaultVisibility);
    const hasHydratedFromSavedValues = useRef(false);

    const rawDisplayedTimeFilters = dashboardDisplay?.displayedTimeFilters;

    const savedDisplayedValues = useMemo(() => {
        if (
            rawDisplayedTimeFilters === undefined ||
            rawDisplayedTimeFilters === null
        ) {
            return null;
        }
        return toStringArray(rawDisplayedTimeFilters);
    }, [rawDisplayedTimeFilters]);

    const displayedPresetValues = useMemo(
        () => getEnabledPresets(presetVisibility),
        [presetVisibility]
    );
    const defaultPresetValues = useMemo(
        () => getEnabledPresets(buildDefaultVisibility()),
        []
    );

    const { mutate: saveDisplayedFilters } = useUpdateDisplayedTimeFilters(
        dashboardId,
        dashboardDisplay
    );

    useEffect(() => {
        setPresetVisibility(
            buildVisibilityFromPresetValues(savedDisplayedValues) ??
                buildDefaultVisibility()
        );
        hasHydratedFromSavedValues.current = true;
    }, [savedDisplayedValues]);

    const persistDisplayedFilters = () => {
        if (!dashboardId || !hasHydratedFromSavedValues.current) return;
        if (
            areStringArraysEqual(
                displayedPresetValues,
                savedDisplayedValues ?? defaultPresetValues
            )
        ) {
            return;
        }
        saveDisplayedFilters(displayedPresetValues);
    };

    const presetOptions = PRESET_CONFIG.map((preset) => {
        if (preset.type === 'timePeriod') {
            return {
                key: preset.key,
                label: `${localize('time.' + preset.rangeType)} ${localize(
                    'time.' + preset.timePeriod
                )}`,
                node: (
                    <TimePeriodFilter
                        type={preset.rangeType}
                        timePeriod={preset.timePeriod}
                    />
                ),
            };
        }

        if (preset.type === 'months') {
            const label =
                preset.rangeType === 'next'
                    ? localize('time.period.nextMonths', {
                          n: preset.months,
                      })
                    : localize('time.period.lastMonths', {
                          n: preset.months,
                      });

            return {
                key: preset.key,
                label,
                node: (
                    <NumberOfMonthsFilter
                        numberOfMonths={preset.months}
                        type={preset.rangeType}
                    />
                ),
            };
        }

        return {
            key: preset.key,
            label: localize('time.ytd'),
            node: <YearToDateFilter />,
        };
    });

    return (
        <div className="flex flex-row flex-wrap items-center gap-md">
            {presetOptions.map((option) =>
                presetVisibility[option.key] ? (
                    <span key={option.key}>{option.node}</span>
                ) : null
            )}
            {canEditDashboard ? (
                <DropdownMenu
                    modal={false}
                    onOpenChange={(open) => {
                        if (!open) persistDisplayedFilters();
                    }}
                >
                    <DropdownMenuTrigger asChild>
                        <IconButton
                            icon="bv:chevron-down"
                            variant="ghost"
                            size="sm"
                            aria-label={localize(
                                'dashboards.options.addTimeFilter'
                            )}
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 shadow-sm">
                        {presetOptions.map((option) => (
                            <DropdownMenuCheckboxItem
                                key={option.key}
                                checked={presetVisibility[option.key]}
                                onSelect={(event) => event.preventDefault()}
                                onCheckedChange={(checked) =>
                                    setPresetVisibility((prev) => ({
                                        ...prev,
                                        [option.key]: Boolean(checked),
                                    }))
                                }
                                className="text-sm text-primary"
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}
            <DateFilterPicker
                range={dateRange}
                onSelectDateRange={onSelectDateRange}
                isActive={isCustomActive}
            />
        </div>
    );
}
