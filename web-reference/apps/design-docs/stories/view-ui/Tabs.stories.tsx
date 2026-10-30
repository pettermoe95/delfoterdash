import type { DashboardFilter } from '@bv/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Tabs> = {
    title: 'View UI/Navigation/Tabs',
    component: Tabs,
};

export default meta;

type Story = StoryObj<typeof DashboardFilter>;

export const Default: Story = {
    render: () => (
        <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="account" icon="bv:user">
                    Account
                </TabsTrigger>
                <TabsTrigger value="password" icon="bv:shield-star">
                    Password
                </TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                Make changes to your account here.
            </TabsContent>
            <TabsContent value="password">
                Change your password here.
            </TabsContent>
        </Tabs>
    ),
};
