import { bvIconNames } from '@brilliant/bds-core';
import { DashboardIcon } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DashboardIcon> = {
    title: 'View UI/Dashboard/DashboardIcon',
    component: DashboardIcon,
    argTypes: {
        icon: {
            control: { type: 'select' },
            options: bvIconNames,
            defaultValue: 'dashboard',
        },
    },
};

export default meta;

type Story = StoryObj<typeof DashboardIcon>;

export const Primary: Story = {
    render: (props) => (
        <div data-theme="dark">
            <DashboardIcon {...props} />
        </div>
    ),
    name: 'DashboardIcon',
    args: { color: 'teal' },
};
