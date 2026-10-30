import type { SelectOption } from '@brilliant/bds-core';
import {
    Button,
    cn,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@brilliant/bds-core';
import { parseDate } from '@internationalized/date';
import type { DateValue } from '@react-types/calendar';
import { ViewFilterFactory } from '~/filters/factory.ts';
import { DateBetweenFilter } from '~/filters/filters.ts';
import { useLocalize } from '~/i18n/I18nContext';
import { useGlobalLayoutMatch } from '~/stores/system';
import { useToggle } from 'react-use';
import { useUpdateDashboardFilter } from '../../../../hooks/useUpdateDashboardFilter.ts';
import { useDashboardContext } from '../../context/dashboardContextValue';
import { useDashboardParams } from '../../hooks/useDashboardParams.tsx';
import { FilterIcon } from '../../svg/Filter.tsx';
import { DateFilters } from './DateFilters.tsx';
import { GlobalFilters } from './GlobalFilters.tsx';

interface DashboardFilterMenuProps {
    conceptFieldOptions: SelectOption[] | undefined;
    allowAddFilter: boolean;
}

export function DashboardFilterMenu({
    conceptFieldOptions,
    allowAddFilter,
}: DashboardFilterMenuProps) {
    const localize = useLocalize();
    const dashboardContext = useDashboardContext();
    const { globalConceptFilters } = dashboardContext;
    const { editMode } = useDashboardParams();
    const isFullscreen = useGlobalLayoutMatch('fullscreen');
    const [isMenuOpen, setIsMenuOpen] = useToggle(false);
    const { enableFilter, disableFilter } = useUpdateDashboardFilter();

    const dateConceptValue = globalConceptFilters.find(
        (f) => f.concept === 'date'
    );
    const dateRange = (() => {
        if (!(dateConceptValue instanceof DateBetweenFilter)) {
            return null;
        }

        const { from, to } = dateConceptValue;
        if (
            typeof from !== 'string' ||
            typeof to !== 'string' ||
            from.trim() === '' ||
            to.trim() === ''
        ) {
            return null;
        }

        return {
            start: parseDate(from),
            end: parseDate(to),
        };
    })();

    if (isFullscreen) return null;

    const handleAddFilter = (
        concept: string,
        shouldEnable?: boolean | 'indeterminate'
    ) => {
        const isConceptEnabled = globalConceptFilters.some(
            (filter) => filter.concept === concept
        );
        const nextEnableState =
            typeof shouldEnable === 'boolean'
                ? shouldEnable
                : !isConceptEnabled;

        if (nextEnableState) {
            if (!isConceptEnabled) {
                enableFilter.mutate(concept);
            }
            return;
        }

        if (isConceptEnabled) {
            disableFilter.mutate(concept);
        }
    };

    const setDateRange = (start: DateValue | null, end: DateValue | null) => {
        if (!start || !end) {
            dashboardContext.clearFilterValue('date');
        } else {
            const viewFilter = ViewFilterFactory.fromDateValue({
                from: start.toString(),
                to: end.toString(),
            });
            if (viewFilter) {
                dashboardContext.updateFilterValue(viewFilter);
            }
        }
    };

    return (
        <div
            className={cn(
                'grid w-full grid-cols-1 items-start gap-md',
                editMode
                    ? 'xl:grid-cols-[auto,1fr,auto]'
                    : 'lg:grid-cols-[auto,1fr,auto]'
            )}
        >
            <div>
                <DropdownMenu
                    open={isMenuOpen}
                    onOpenChange={setIsMenuOpen}
                    modal={false}
                >
                    {allowAddFilter && (
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outlined"
                                size="sm"
                                color="gray"
                                className="mt-2xl"
                            >
                                <FilterIcon />
                                {localize('dashboards.create.addFilter')}
                            </Button>
                        </DropdownMenuTrigger>
                    )}
                    <DropdownMenuContent
                        align="start"
                        className="w-96 shadow-sm"
                        asChild
                    >
                        <div className="flex flex-col">
                            {conceptFieldOptions?.map((option, index) => (
                                <div key={index}>
                                    <DropdownMenuCheckboxItem
                                        checked={globalConceptFilters.some(
                                            (f) => f.concept === option.value
                                        )}
                                        onCheckedChange={(checked) =>
                                            handleAddFilter(
                                                option.value,
                                                checked
                                            )
                                        }
                                        className="text-sm text-primary"
                                    >
                                        {option.label}
                                    </DropdownMenuCheckboxItem>
                                </div>
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-start gap-x-sm gap-y-md">
                <GlobalFilters
                    filterConcepts={globalConceptFilters}
                    conceptFieldOptions={conceptFieldOptions}
                    allowAddFilter={allowAddFilter}
                    onConceptValueChange={(filter) =>
                        dashboardContext.updateFilterValue(filter)
                    }
                    onDeleteFilter={(concept) => disableFilter.mutate(concept)}
                    onClearFilterValue={(concept) =>
                        dashboardContext.clearFilterValue(concept)
                    }
                />
            </div>

            <div className="mt-2xl w-full lg:justify-self-end">
                <DateFilters
                    dateRange={dateRange}
                    onSelectDateRange={setDateRange}
                />
            </div>
        </div>
    );
}
