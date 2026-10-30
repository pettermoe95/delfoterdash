import { Tooltip } from '@brilliant/bds-core';
import type { Concept } from '@bv/api';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { useConceptStats } from '../../hooks/useConceptUsage';
import { ConceptStatsItem } from './ConceptStatsItem';
import { buildStatsItems } from './StatItems';

interface ConceptStatsProps {
    conceptName: Concept['concept_name'];
}

export function ConceptStats({ conceptName }: ConceptStatsProps) {
    const localize = useLocalize();
    const { hasPermission } = useAccount();
    const {
        data: conceptUsage,
        isLoading,
        isError,
    } = useConceptStats(conceptName);

    if (!hasPermission(PERMISSION.CONCEPTS_EDIT)) {
        return (
            <div
                data-component="concepts-overview"
                className="text-danger p-md"
            >
                {localize('users.noAccess')}
            </div>
        );
    }

    const items = buildStatsItems({
        stats: conceptUsage,
        isLoading,
        isError,
        localize,
    });

    const statsItems = items.map(({ key, title, count, description }) => ({
        key,
        title,
        value: formatCount(count, isLoading, isError),
        tooltipTitle: title,
        tooltipDescription: description,
    }));

    return (
        <div className="flex w-full flex-wrap justify-center gap-xs pb-5xl lg:justify-start">
            {statsItems.map(
                ({ key, title, value, tooltipTitle, tooltipDescription }) => {
                    const content = (
                        <div className="flex h-[90px] w-[102px] items-center justify-center divide-x-2 divide-secondary rounded-sm border border-tertiary bg-primary shadow-sm md:h-[102px] md:w-[122px]">
                            <ConceptStatsItem title={title} value={value} />
                        </div>
                    );

                    return (
                        <Tooltip
                            key={key}
                            title={tooltipTitle}
                            description={tooltipDescription}
                            side="top"
                        >
                            {content}
                        </Tooltip>
                    );
                }
            )}
        </div>
    );
}

function formatCount(
    count: number,
    isLoading: boolean,
    isError: boolean
): string {
    if (isLoading) return '...';
    if (isError) return '—';
    return String(count);
}
