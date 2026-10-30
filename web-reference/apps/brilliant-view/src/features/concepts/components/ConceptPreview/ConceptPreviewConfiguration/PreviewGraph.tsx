import type {
    ContinuousDimension,
    DiscreteDimension,
    GraphDataSeries2D,
} from '@bv/graph-components';
import { AxisGraph } from '@bv/graph-components';
import { useLocaleValue, useLocalize } from '~/i18n/I18nContext';

interface PreviewGraphProps {
    seriesData:
        | GraphDataSeries2D<DiscreteDimension, ContinuousDimension>
        | null
        | undefined;
    isFetching: boolean;
    errorMessage?: string;
}

export function PreviewGraph({
    seriesData,
    isFetching,
    errorMessage,
}: PreviewGraphProps) {
    const localize = useLocalize();
    const locale = useLocaleValue();
    return (
        <div className="w-full overflow-x-auto">
            <div className="h-[240px] min-w-[600px] rounded-sm bg-primary pb-2 pr-5 pt-4 sm:h-[300px]">
                {errorMessage ? (
                    <div className="text-error flex h-full flex-col items-center justify-center bv-text-font-sm-regular">
                        <p>{localize('miscTerms.noPreview')}</p>
                        <p>{errorMessage}</p>
                    </div>
                ) : seriesData ? (
                    <AxisGraph
                        data={seriesData}
                        showLegends={false}
                        localize={localize}
                        locale={locale}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-secondary bv-text-font-sm-regular">
                        {isFetching
                            ? 'Loading preview...'
                            : 'Preview data unavailable for the current selection.'}
                    </div>
                )}
            </div>
        </div>
    );
}
