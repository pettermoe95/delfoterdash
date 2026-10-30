import { Checkbox, Tooltip } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

type ShowDecimalsProps = {
    isShowingDecimals: boolean;
    onChangeDecimals: (showDecimals: boolean) => void;
    useHint?: boolean;
};

export function ShowDecimals({
    isShowingDecimals,
    onChangeDecimals,
    useHint,
}: ShowDecimalsProps) {
    const localize = useLocalize();
    const checkbox = (
        <div>
            <Checkbox
                size="sm"
                text={localize('dashboards.options.showDecimals')}
                checked={isShowingDecimals}
                onCheckedChange={onChangeDecimals}
            />
        </div>
    );

    return (
        <div data-component="show-decimals" className="flex flex-col">
            <div className="flex flex-col gap-1.5">
                <div className="border-primary py-sm text-primary">
                    {useHint ? (
                        <Tooltip
                            side="top"
                            align="start"
                            triggerAsChild
                            title={localize(
                                'dashboards.options.showDecimalsHint'
                            )}
                        >
                            {checkbox}
                        </Tooltip>
                    ) : (
                        checkbox
                    )}
                </div>
            </div>
        </div>
    );
}
