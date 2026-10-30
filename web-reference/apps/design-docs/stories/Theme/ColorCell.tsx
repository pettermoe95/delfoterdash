import type { CellContext } from '@tanstack/react-table';
import React from 'react';

export type ColorItem = {
    id: string;
    name: string;
    color: string;
};

export function ColorCell<T extends ColorItem>(cell: CellContext<T, string>) {
    return (
        <div
            style={{
                backgroundColor: cell.getValue(),
                position: 'absolute',
                top: '5%',
                left: 0,
                height: '90%',
                width: '100%',
                padding: '4px 0',
            }}
        />
    );
}
