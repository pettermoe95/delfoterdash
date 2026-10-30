import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    IconButton,
} from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DropdownMenu> = {
    title: 'Core/Content/DropdownMenu',
    component: DropdownMenu,
    argTypes: {},
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Primary: Story = {
    render: (_props) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <IconButton icon="bv:chevron-down" variant="ghost" size="sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <span>Billing</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <div>Hey</div>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
    name: 'DropdownMenu',
};
