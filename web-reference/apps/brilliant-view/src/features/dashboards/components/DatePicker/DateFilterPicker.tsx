import type { DateValue } from '@react-types/calendar';
import type { RangeValue } from '@react-types/shared';
import { useState } from 'react';
import { SelectDateRangePopover } from './SelectRangePopover';

interface DateFilterPickerProps {
    range: Range | null;
    onSelectDateRange: (start: DateValue | null, end: DateValue | null) => void;
    isActive?: boolean;
}

type Range = RangeValue<DateValue>;

export function DateFilterPicker({
    range,
    onSelectDateRange,
    isActive = false,
}: DateFilterPickerProps) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <div className="flex items-center gap-2">
                <SelectDateRangePopover
                    range={range}
                    onRangeChange={(r: Range | null) => {
                        if (r) {
                            onSelectDateRange(r.start, r.end);
                        } else {
                            onSelectDateRange(null, null);
                        }
                    }}
                    open={open}
                    setOpen={setOpen}
                    isActive={isActive}
                />
            </div>
        </div>
    );
}
