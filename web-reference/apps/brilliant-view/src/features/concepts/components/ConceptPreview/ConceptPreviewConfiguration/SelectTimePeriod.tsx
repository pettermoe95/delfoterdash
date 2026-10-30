import { SingleSelect } from '@brilliant/bds-core';
import { createPeriodOptions } from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers';
import type { Period } from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/offsetAndPeriodFilterHelpers';
import { useLocalize } from '~/i18n/I18nContext';

interface SelectTimePeriodProps {
    deicticModifier: number;
    handleDeicticChange: (modifier: string | number) => void;
    timePeriod: string;
    setTimePeriod: (timePeriod: Period) => void;
}

export function SelectTimePeriod({
    deicticModifier,
    handleDeicticChange,
    timePeriod,
    setTimePeriod,
}: SelectTimePeriodProps) {
    const localize = useLocalize();
    return (
        <div>
            <p className="mb-xs pl-1 text-secondary bv-text-font-sm-medium">
                {localize('concepts.form.previewSelectPeriod')}
            </p>
            <div className="flex gap-sm">
                <div className="w-[125px]">
                    <SingleSelect
                        size="sm"
                        options={[
                            { value: '0', label: localize('time.this') },
                            { value: '-1', label: localize('time.last') },
                        ]}
                        value={String(deicticModifier)}
                        onChange={handleDeicticChange}
                    />
                </div>
                <div className="w-[150px]">
                    <SingleSelect
                        size="sm"
                        options={createPeriodOptions(localize)}
                        value={timePeriod}
                        onChange={(value) => setTimePeriod(value as Period)}
                    />
                </div>
            </div>
        </div>
    );
}
