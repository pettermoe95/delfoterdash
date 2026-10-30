import { Icon } from '@brilliant/bds-core';
import { useIsMobile } from '@brilliant/components';
import { getDisplayGraphName } from '~/features/dashboards/components/EditPanel/NewGraphStudio/Utils/textHelpers';
import { EditableGraphTitle } from '~/features/dashboards/components/Forms/GraphFormComponents/EditableGraphTitle/EditableGraphTitle';
import { useMetricConcepts } from '~/hooks';
import { useLocalize } from '~/i18n/I18nContext';
import { useGlobalLayoutMatch } from '~/stores/system';
import { useDashboardGraphContext } from './dashboardGraphContext';
import { DashboardGraphMenu } from './DashboardGraphMenu';

type DashboardGraphHeaderProps = {
    setGraphTitle?: (graphTitle: string) => void;
    showEditIcon?: boolean;
};

export function DashboardGraphHeader({
    setGraphTitle,
    showEditIcon,
}: DashboardGraphHeaderProps) {
    const isFullscreen = useGlobalLayoutMatch('fullscreen');
    const { layout, hideMenu } = useDashboardGraphContext();
    const isMobile = useIsMobile();
    const localize = useLocalize();
    const { data: metrics } = useMetricConcepts();

    const title = getDisplayGraphName({
        name: layout.graph.name,
        query: layout.graph.query,
        metrics,
        localize,
    });

    if (isFullscreen) {
        return (
            <div className="flex w-full justify-between px-xl pt-xl">
                <b>{title.toUpperCase()}</b>
            </div>
        );
    }

    return (
        <div
            data-component="dashboard-graph-header"
            className="flex w-full justify-between px-xl pt-xl"
        >
            <div className="flex min-w-0 max-w-full flex-shrink items-center gap-sm">
                <div className="bv-graph-font-md-regular w-full truncate">
                    <EditableGraphTitle
                        graphTitle={layout.graph.name}
                        displayTitle={title}
                        setGraphTitle={setGraphTitle}
                        showEditIcon={showEditIcon}
                    />
                </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
                <DashboardLoadingIndicator />
                {!isMobile && <div>{!hideMenu && <DashboardGraphMenu />}</div>}
            </div>
        </div>
    );
}

export function DashboardLoadingIndicator() {
    const { isLoading } = useDashboardGraphContext();

    if (isLoading) return <Icon icon="bv:loading" className="animate-spin" />;
    return <></>;
}
