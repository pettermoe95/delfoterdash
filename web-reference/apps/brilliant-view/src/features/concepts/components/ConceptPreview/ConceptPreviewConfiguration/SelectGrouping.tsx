import type { SelectOption } from '@brilliant/bds-core';
import { ComboBox } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

interface SelectGroupingProps {
    grouping: string;
    groupingOptions: SelectOption[];
    handleGroupChange: (value: string | string[]) => void;
}

export function SelectGrouping({
    grouping,
    groupingOptions,
    handleGroupChange,
}: SelectGroupingProps) {
    const localize = useLocalize();
    return (
        <div>
            <p className="mb-xs pl-1 text-secondary bv-text-font-sm-medium xl:pl-0 xl:pr-2 xl:text-right">
                {localize('miscTerms.groupedBy')}
            </p>
            <div className="min-w-[200px]">
                <ComboBox
                    value={grouping}
                    options={groupingOptions}
                    onChange={handleGroupChange}
                    localizeFn={localize}
                />
            </div>
        </div>
    );
}
