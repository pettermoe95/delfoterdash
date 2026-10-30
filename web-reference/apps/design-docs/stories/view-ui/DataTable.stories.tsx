import { buildCompaniesTable, DataTable } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useMemo } from 'react';

const meta: Meta<typeof DataTable> = {
    title: 'View UI/Data Table',
    component: DataTable,
    args: {
        height: 500,
        virtual: true,
        sortable: true,
    },
};

export default meta;

type Story = StoryObj<typeof DataTable>;

export const Primary: Story = {
    render: ({
        data: _data,
        columns: _columns,
        rowConfig: _rowConfig,
        ...args
    }) => {
        const companiesTable = useMemo(
            () => buildCompaniesTable(args.virtual ? 9001 : 100),
            [args.virtual]
        );

        return (
            <div className="space-y-lg">
                <h3>Rows: {companiesTable.data.length}</h3>
                <DataTable
                    data={companiesTable.data}
                    columns={companiesTable.columns}
                    defaultSorting={companiesTable.defaultSorting}
                    rowConfig={{
                        onClick: (row) => {
                            alert('Row clicked: ' + row.id);
                        },
                    }}
                    height={500}
                    {...args}
                />
            </div>
        );
    },
    name: 'DataTable',
    parameters: {
        controls: {
            include: ['height', 'virtual', 'sortable'],
        },
    },
};
