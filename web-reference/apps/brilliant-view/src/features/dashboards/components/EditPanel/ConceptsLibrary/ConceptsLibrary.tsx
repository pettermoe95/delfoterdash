import { Icon } from '@brilliant/bds-core';
import { useDrag } from '@brilliant/components';
import type { DashboardConceptMetric } from '@bv/api';
import { cn } from '@bv/ui';
import type { DashboardCellDroppable } from '~/features/dashboards';
import { ConceptItem } from '~/features/dashboards/components/EditPanel/ConceptsLibrary/ConceptItem.tsx';
import { useLocalize } from '~/i18n/I18nContext';
import { DASHBOARD_DRAG_DROP_TYPE } from '~/site/dashboard/types.ts';
import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';

interface ConceptsLibraryProps {
    metrics: DashboardConceptMetric[];
    hasConcepts: boolean;
}

export function ConceptsLibrary({
    metrics,
    hasConcepts,
}: ConceptsLibraryProps) {
    const localize = useLocalize();

    const noDataText = !hasConcepts
        ? localize('dashboards.create.noConceptsFound1')
        : localize('dashboards.create.noConceptsFound2');

    const conceptItems = metrics.map((metric) => {
        return (
            <ConceptItemDragWrapper key={metric.concept_name} metric={metric}>
                <ConceptItem metric={metric} />
            </ConceptItemDragWrapper>
        );
    });

    return (
        <div
            className={cn(
                'flex flex-col gap-md py-md pr-1 *:overflow-y-scroll'
            )}
        >
            {metrics.length ? (
                conceptItems
            ) : (
                <div className="flex items-center gap-sm rounded-md border border-secondary bg-secondary p-md text-secondary bv-text-font-sm-regular">
                    <Icon
                        icon="bv:alert-circle"
                        className="text-lg text-primary"
                    />
                    <span>{noDataText}</span>
                </div>
            )}
        </div>
    );
}

function ConceptItemDragWrapper({
    metric,
    children,
}: PropsWithChildren<{
    metric: DashboardConceptMetric;
}>) {
    const getData = useCallback(() => {
        return {
            metric,
        };
    }, [metric]);

    const drag = useDrag<DashboardCellDroppable, unknown>({
        id: metric.concept_name,
        data: getData,
        type: DASHBOARD_DRAG_DROP_TYPE,
        originalDisplay: 'transparent',
    });

    return (
        <div {...drag.anchorBindings}>
            <drag.Original>{children}</drag.Original>
            <drag.Preview>
                <div className="opacity-40">{children}</div>
            </drag.Preview>
        </div>
    );
}
