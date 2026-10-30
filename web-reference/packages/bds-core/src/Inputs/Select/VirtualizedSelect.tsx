import { useVirtualizer } from '@tanstack/react-virtual';
import React from 'react';
import type { SelectOptionMulti } from './MultiSelect';

export function VirtualizedSelect({
    options,
    onChange,
    selectedValues = [],
    rowRender,
}: {
    options: SelectOptionMulti[];
    onChange: (value: string) => void;
    selectedValues?: string[];
    rowRender?: (props: { option: SelectOptionMulti }) => React.ReactNode;
}) {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const count = options.length;
    const virtualizer = useVirtualizer({
        count,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 45,
    });

    const items = virtualizer.getVirtualItems();

    return (
        <div
            ref={parentRef}
            className="List"
            style={{
                height: 140,
                overflowY: 'auto',
            }}
        >
            <div
                style={{
                    height: virtualizer.getTotalSize(),
                    width: '100%',
                    position: 'relative',
                }}
            >
                {items.map((virtualRow) => {
                    const option = options[virtualRow.index];
                    if (!option) return null;

                    const isSelected = selectedValues.includes(option.value);

                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            onClick={() => onChange(option.value)}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            {rowRender ? (
                                rowRender({ option })
                            ) : (
                                <>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onChange(option.value)}
                                        className="cursor-pointer"
                                    />
                                    {option.label}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
