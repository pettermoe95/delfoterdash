import type { LocalizeFn } from '@bv/i18n-utils';
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { ProgressLineProps } from './ProgressLine';
import { ProgressLine } from './ProgressLine';

export interface ProgressLineResponsiveProps
    extends Omit<ProgressLineProps, 'width' | 'height'> {
    /** Optional min/max pixel sizes */
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    localize?: LocalizeFn;
}

const ProgressLineResponsive: React.FC<ProgressLineResponsiveProps> = ({
    minWidth = 0,
    minHeight = 0,
    maxWidth = Infinity,
    maxHeight = Infinity,
    localize,
    ...rest
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return;
        const update = () => {
            const rect = node.getBoundingClientRect();
            setSize({
                width: Math.max(minWidth, Math.min(rect.width, maxWidth)),
                height: Math.max(minHeight, Math.min(rect.height, maxHeight)),
            });
        };
        update();
        const ro = new window.ResizeObserver(update);
        ro.observe(node);
        return () => ro.disconnect();
    }, [minWidth, minHeight, maxWidth, maxHeight]);
    return (
        <div ref={ref} style={{ width: '100%', height: '100%' }}>
            {size.width > 0 && size.height > 0 && (
                <ProgressLine
                    {...rest}
                    width={size.width}
                    height={size.height}
                    localize={localize}
                />
            )}
        </div>
    );
};

export default ProgressLineResponsive;
