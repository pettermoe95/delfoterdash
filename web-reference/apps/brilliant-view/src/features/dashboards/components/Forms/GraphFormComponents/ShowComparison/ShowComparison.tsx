import { Checkbox } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

type ShowComparisonProps = {
    isShowingComparison: boolean;
    toggleComparison: (toggleComparison: boolean) => void;
    id: string;
};

export function ShowComparison({
    isShowingComparison,
    toggleComparison,
    id,
}: ShowComparisonProps) {
    const localize = useLocalize();
    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-1.5">
                <div className="border-primary bg-primary py-sm text-primary">
                    <Checkbox
                        id={id}
                        size="sm"
                        text={localize('dashboards.options.showComparison')}
                        checked={isShowingComparison}
                        onCheckedChange={toggleComparison}
                    />
                </div>
            </div>
        </div>
    );
}
