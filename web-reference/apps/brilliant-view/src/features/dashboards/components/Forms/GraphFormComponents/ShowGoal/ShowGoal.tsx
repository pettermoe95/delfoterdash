import { Checkbox } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

type ShowGoalProps = {
    isShowingGoal: boolean;
    onChangeGoal: (goal: boolean) => void;
    id: string;
};

export function ShowGoal({ isShowingGoal, onChangeGoal, id }: ShowGoalProps) {
    const localize = useLocalize();
    return (
        <div data-component="show-goal" className="flex flex-col">
            <div className="flex flex-col gap-1.5">
                <div className="border-primary bg-primary py-sm text-primary">
                    <Checkbox
                        id={id}
                        size="sm"
                        text={localize('dashboards.options.showGoal')}
                        checked={isShowingGoal}
                        onCheckedChange={onChangeGoal}
                    />
                </div>
            </div>
        </div>
    );
}
