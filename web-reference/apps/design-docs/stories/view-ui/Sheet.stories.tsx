import type { SingleSelect } from '@brilliant/bds-core';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@bv/ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Sheet> = {
    title: 'View UI/Sheet',
    component: Sheet,
};

export default meta;

type Story = StoryObj<typeof SingleSelect>;

export const Primary: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger>Open</SheetTrigger>
            <SheetContent
                className="w-[400px] sm:w-[540px]"
                onPointerDownOutside={(e) => e.preventDefault()}
                overlay
            >
                <SheetHeader>
                    <SheetTitle>Are you absolutely sure?</SheetTitle>
                    <SheetDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    ),
};
