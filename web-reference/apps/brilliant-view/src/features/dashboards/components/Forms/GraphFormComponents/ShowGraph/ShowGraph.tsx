import { Checkbox } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';

type ShowGraphProps = {
    isShowingGraph: boolean;
    onChangeGraph: (graph: boolean) => void;
    id: string;
};

export function ShowGraph({
    isShowingGraph,
    onChangeGraph,
    id,
}: ShowGraphProps) {
    const localize = useLocalize();
    return (
        <div data-component="show-graph" className="flex flex-col">
            <div className="flex flex-col gap-1.5">
                <div className="border-primary bg-primary py-sm text-primary">
                    <Checkbox
                        id={id}
                        size="sm"
                        text={localize('dashboards.options.showGraph')}
                        checked={isShowingGraph}
                        onCheckedChange={onChangeGraph}
                    />
                </div>
            </div>
        </div>
    );
}
