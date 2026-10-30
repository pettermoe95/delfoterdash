import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Table } from './Table';
//import { Checkbox } from '../../Inputs/Checkbox/Checkbox';

const meta: Meta<typeof Table> = {
    title: 'Content/Table',
    component: Table,
};

export default meta;

type Story = StoryObj<typeof Table>;

const rows = Array.from<number>(Array(15));
const columns = Array.from<number>(Array(8));

export const Primary: Story = {
    render: () => (
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)' }}>
            <div
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    overflowX: 'auto',
                    maxHeight: '300px',
                }}
            >
                <Table highlightOnHover stickyHeader>
                    <Table.Thead>
                        <Table.Tr header>
                            <Table.Th>
                                {/*
                                <Checkbox size="sm" />
                              */}
                            </Table.Th>
                            {columns.map((i) => (
                                <Table.Th key={i}>Heading</Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <Table.Tr key={row} active={idx === 3}>
                                <Table.Td>
                                    {/*
                                
                                    <Checkbox size="sm" />
                                */}
                                </Table.Td>
                                {columns.map((column) => (
                                    <Table.Td key={column}>Content</Table.Td>
                                ))}
                            </Table.Tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    ),
};
