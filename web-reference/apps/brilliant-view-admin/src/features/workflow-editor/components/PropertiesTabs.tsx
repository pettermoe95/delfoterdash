import { TabsList, TabsTrigger } from '@bv/ui';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonIcon } from './ButtonIcon';

type PropertiesTabsProps = {
    sections: string[];
    value: string;
};

export function PropertiesTabs({ sections, value }: PropertiesTabsProps) {
    const bar = useRef<HTMLDivElement>(null);
    const viewport = useRef<HTMLDivElement>(null);
    const [scroll, setScroll] = useState({
        overflow: false,
        left: false,
        right: false,
    });
    const measure = useCallback(() => {
        const container = viewport.current;
        const list = container?.querySelector<HTMLElement>('[role="tablist"]');
        if (!container || !list || !bar.current) return;
        const next = {
            overflow: list.scrollWidth > bar.current.clientWidth + 1,
            left: container.scrollLeft > 1,
            right:
                container.scrollLeft + container.clientWidth <
                container.scrollWidth - 1,
        };
        setScroll((previous) =>
            previous.overflow === next.overflow &&
            previous.left === next.left &&
            previous.right === next.right
                ? previous
                : next
        );
    }, []);
    useEffect(() => {
        const container = viewport.current;
        const list = container?.querySelector<HTMLElement>('[role="tablist"]');
        const observer = new ResizeObserver(measure);
        if (bar.current) observer.observe(bar.current);
        if (container) observer.observe(container);
        if (list) observer.observe(list);
        measure();
        return () => observer.disconnect();
    }, [measure]);
    useEffect(() => {
        const header = bar.current;
        const container = viewport.current;
        if (!header || !container) return;
        const onWheel = (event: WheelEvent) => {
            if (
                event.ctrlKey ||
                event.defaultPrevented ||
                container.scrollWidth <= container.clientWidth + 1
            )
                return;
            const delta =
                Math.abs(event.deltaX) > Math.abs(event.deltaY)
                    ? event.deltaX
                    : event.deltaY;
            const unit =
                event.deltaMode === WheelEvent.DOM_DELTA_LINE
                    ? 16
                    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
                      ? container.clientWidth
                      : 1;
            event.preventDefault();
            container.scrollLeft += delta * unit;
        };
        // React wheel handlers are passive, so use a native listener to redirect scrolling.
        header.addEventListener('wheel', onWheel, { passive: false });
        return () => header.removeEventListener('wheel', onWheel);
    }, []);
    useEffect(() => {
        viewport.current
            ?.querySelector<HTMLElement>('[aria-selected="true"]')
            ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [value, scroll.overflow]);
    const scrollBy = (direction: number) => {
        const container = viewport.current;
        container?.scrollBy({
            left: direction * container.clientWidth * 0.75,
            behavior: 'smooth',
        });
    };
    const scrollLeft = () => scrollBy(-1);
    const scrollRight = () => scrollBy(1);
    const renderTab = (section: string) => (
        <TabsTrigger
            key={section}
            value={section}
            className="we-properties-tab"
        >
            {section}
        </TabsTrigger>
    );
    return (
        <div className="we-properties-tab-bar" ref={bar}>
            {scroll.overflow && (
                <button
                    type="button"
                    className="we-tab-scroll"
                    aria-label="Scroll properties tabs left"
                    disabled={!scroll.left}
                    onClick={scrollLeft}
                >
                    <ButtonIcon path={mdiChevronLeft} />
                </button>
            )}
            <div
                className="we-properties-tab-viewport"
                ref={viewport}
                onScroll={measure}
            >
                <TabsList className="we-tabs" aria-label="Worker properties">
                    {sections.map(renderTab)}
                </TabsList>
            </div>
            {scroll.overflow && (
                <button
                    type="button"
                    className="we-tab-scroll"
                    aria-label="Scroll properties tabs right"
                    disabled={!scroll.right}
                    onClick={scrollRight}
                >
                    <ButtonIcon path={mdiChevronRight} />
                </button>
            )}
        </div>
    );
}
