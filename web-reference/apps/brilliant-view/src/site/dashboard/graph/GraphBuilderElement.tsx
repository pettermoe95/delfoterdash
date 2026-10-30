import type { DashboardLayoutItem } from '@bv/api';
import { ReactComponent as AIGraphIcon } from '~/assets/graphs/ai.svg';
import { DashboardGraphProvider } from './dashboardGraphContext';
import { DashboardGraphHeader } from './DashboardGraphHeader';

type GraphBuilderElementProps = {
    layout: DashboardLayoutItem;
};

export function GraphBuilderElement({ layout }: GraphBuilderElementProps) {
    return (
        <DashboardGraphProvider value={{ layout, hideMenu: true }}>
            <div className="flex h-full w-full flex-col justify-start gap-none">
                <DashboardGraphHeader />
                <div className="flex flex-1 items-center justify-center">
                    <AIGraphIcon className="w-full" />
                </div>
            </div>
        </DashboardGraphProvider>
    );
}
