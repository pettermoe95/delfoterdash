import { DashboardFilter } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const filterOptions = [
    {
        label: 'All',
        value: 'all',
    },
    {
        label: 'Mine',
        value: 'mine',
    },
    {
        label: 'Shared',
        value: 'shared',
    },
];

const meta: Meta<typeof DashboardFilter> = {
    title: 'View UI/Dashboard/DashboardFilter',
    component: DashboardFilter,
    args: {
        label: 'Documents',
        options: filterOptions,
        defaultValue: 'all',
    },
};

export default meta;

type Story = StoryObj<typeof DashboardFilter>;

export const Default: Story = {
    render: (props) => {
        const [value, setValue] = useState(props.defaultValue ?? '');
        return (
            <DashboardFilter
                {...props}
                value={value}
                onChange={(option) => setValue(option.value)}
            />
        );
    },
};
