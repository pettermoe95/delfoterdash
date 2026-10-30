import {
    Content,
    DateField,
    defaultTheme,
    Dialog,
    Flex,
    Provider,
} from '@adobe/react-spectrum';
import {
    Button as BdsButton,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@brilliant/bds-core';
import { pickColorBasedOnTheme } from '@brilliant/components';
import {
    CalendarDate,
    getLocalTimeZone,
    startOfMonth,
    today,
} from '@internationalized/date';
import { RangeCalendar } from '@react-spectrum/calendar';
import type { DateValue } from '@react-types/calendar';
import type { RangeValue } from '@react-types/shared';
import { useLocaleValue, useLocalize } from '~/i18n/I18nContext';
import { useActiveTheme } from '~/stores/system';
import { SelectDatesButton } from './SelectDatesButton';
import { useResolvedColorScheme } from './useResolvedColorScheme';

type Range = RangeValue<DateValue>;

export interface SelectDateRangePopoverProps {
    range: Range | null;
    onRangeChange: (r: Range | null) => void;
    open: boolean;
    setOpen: (isOpen: boolean) => void;
    isActive?: boolean;
}

export function SelectDateRangePopover({
    range,
    onRangeChange,
    open,
    setOpen,
    isActive = false,
}: SelectDateRangePopoverProps) {
    const localize = useLocalize();
    const locale = useLocaleValue();
    const activeTheme = useActiveTheme();
    const colorScheme = useResolvedColorScheme(activeTheme);
    const isLgScreen = window.innerWidth > 1024;
    const isSmScreen = window.innerWidth < 500;
    const colorsBrand = pickColorBasedOnTheme('#4B5565', '#ECECED');

    const setStart = (start: DateValue | null) => {
        if (start == null) return onRangeChange(null);
        onRangeChange({ start, end: range?.end ?? start });
    };
    const setEnd = (end: DateValue | null) => {
        if (end == null) return onRangeChange(null);
        onRangeChange({ start: range?.start ?? end, end });
    };

    // When no dates are selected, open showing previous + current month
    const defaultFocusedValue = (() => {
        if (range) return undefined;
        const timeZone = getLocalTimeZone();
        const date = today(timeZone);
        const prevYear = date.month === 1 ? date.year - 1 : date.year;
        const prevMonth = date.month === 1 ? 12 : date.month - 1;
        return startOfMonth(new CalendarDate(prevYear, prevMonth, 1));
    })();

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            data-component="select-date-range-popover"
        >
            <PopoverTrigger asChild>
                <SelectDatesButton
                    open={open}
                    setOpen={setOpen}
                    color={colorsBrand}
                    isActive={isActive}
                    localize={localize}
                />
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={isSmScreen ? 0 : 8}
                className={`${
                    isSmScreen
                        ? 'max-w-screen flex max-h-screen w-screen justify-center overflow-y-auto'
                        : 'w-auto'
                } border-none bg-transparent p-0 shadow-md`}
            >
                <Provider
                    theme={defaultTheme}
                    colorScheme={colorScheme}
                    locale={locale}
                >
                    <Dialog
                        UNSAFE_style={{
                            inlineSize: isLgScreen
                                ? '650px'
                                : isSmScreen
                                  ? '100vw'
                                  : '100%',
                            maxInlineSize: isLgScreen
                                ? '650px'
                                : isSmScreen
                                  ? '100vw'
                                  : '92vw',
                            maxBlockSize: isSmScreen ? '90vh' : undefined,
                            overflow: isSmScreen ? 'hidden' : undefined,
                            borderRadius: '12px',
                            background: 'var(--bg-primary)',
                            border: '1px var(--border-primary) solid',
                        }}
                    >
                        <Content
                            UNSAFE_style={{
                                maxBlockSize: isSmScreen ? '90vh' : undefined,
                                overflowY: isSmScreen ? 'auto' : undefined,
                                paddingBottom: isSmScreen ? '30px' : undefined,
                            }}
                        >
                            <Flex direction="column" gap="size-200">
                                <Flex justifyContent="center" width="100%">
                                    <RangeCalendar
                                        visibleMonths={isLgScreen ? 2 : 1}
                                        aria-label="Pick range"
                                        value={range ?? null}
                                        onChange={onRangeChange}
                                        defaultFocusedValue={
                                            defaultFocusedValue
                                        }
                                    />
                                </Flex>

                                <Flex
                                    direction={isLgScreen ? 'row' : 'column'}
                                    justifyContent={
                                        isLgScreen ? 'space-between' : 'start'
                                    }
                                    alignItems={
                                        isLgScreen ? 'center' : 'stretch'
                                    }
                                    gap="size-200"
                                    width={isLgScreen ? '570px' : '100%'}
                                >
                                    <Flex
                                        gap="size-100"
                                        direction={
                                            isLgScreen ? 'row' : 'column'
                                        }
                                        width={isLgScreen ? 'auto' : '100%'}
                                    >
                                        <DateField<DateValue>
                                            label={localize('filters.from')}
                                            value={range?.start ?? null}
                                            onChange={setStart}
                                        />
                                        <DateField<DateValue>
                                            label={localize('filters.to')}
                                            value={range?.end ?? null}
                                            onChange={setEnd}
                                        />
                                    </Flex>

                                    <Flex
                                        gap="size-100"
                                        marginTop={
                                            isLgScreen ? '20px' : 'size-200'
                                        }
                                    >
                                        <BdsButton
                                            variant="outlined"
                                            color="gray"
                                            size="sm"
                                            onClick={() => onRangeChange(null)}
                                        >
                                            {localize('filters.clear')}
                                        </BdsButton>
                                        <BdsButton
                                            variant="filled"
                                            color="primary"
                                            size="sm"
                                            onClick={() => setOpen(false)}
                                        >
                                            {localize('miscTerms.close')}
                                        </BdsButton>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Content>
                    </Dialog>
                </Provider>
            </PopoverContent>
        </Popover>
    );
}
