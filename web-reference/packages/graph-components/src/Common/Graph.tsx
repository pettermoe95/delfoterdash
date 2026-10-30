import { Column } from '@brilliant/components';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import { useMeasure } from 'react-use';
import type { UseMeasureRef } from 'react-use/lib/useMeasure';
import type { GraphLayout } from '..';
import { GraphColorThemeInjection } from '../Theme';
import { SentimentColorThemeInjection } from '../Theme/SentimentColorTheme';
import type { GraphTooltipContextType } from './Tooltip/GraphTooltip';
import { GraphTooltipWrapper } from './Tooltip/GraphTooltip';

type GraphProps = {
    layout: GraphLayout;
    layoutRef: UseMeasureRef<HTMLDivElement>;
    header?: ReactNode;
    onTooltipContextChanged?: (t: GraphTooltipContextType) => void;
    children: ReactElement<SVGElement>[] | ReactElement<SVGElement>;
    minHeight?: number;
};

/**
 * Generic graph wrapper that adds common functionality
 * such as tooltips and themes to all graphs
 */
export function Graph({
    layout,
    layoutRef: measureRef,
    header,
    onTooltipContextChanged,
    children,
    minHeight,
}: GraphProps) {
    const [headerRef, headerBounds] = useMeasure<HTMLDivElement>();
    const svgRef = useRef<SVGSVGElement>(null);
    const onContextChanged = useCallback(
        (context: GraphTooltipContextType) => {
            onTooltipContextChanged?.(context);
        },
        [onTooltipContextChanged]
    );

    const containerStyle: CSSProperties = {
        width: '100%',
        flex: 1,
        alignSelf: 'stretch',
        height: '100%',
        ...(minHeight !== undefined
            ? { minHeight: `${minHeight}px` }
            : undefined),
    };
    return (
        <Column align="flex-start" style={containerStyle}>
            {header && (
                <div ref={headerRef} className="self-end">
                    {header}
                </div>
            )}
            <div
                ref={measureRef}
                style={{
                    width: '100%',
                    height: `calc(100% - ${headerBounds.height}px)`,
                    flex: 1,
                }}
            >
                <GraphTooltipWrapper
                    svgRef={svgRef}
                    layout={layout}
                    onContextChanged={onContextChanged}
                >
                    <svg
                        height={minHeight ? minHeight : '100%'}
                        width="100%"
                        ref={svgRef}
                    >
                        <GraphColorThemeInjection />
                        <SentimentColorThemeInjection />
                        {children}
                    </svg>
                </GraphTooltipWrapper>
            </div>
        </Column>
    );
}
