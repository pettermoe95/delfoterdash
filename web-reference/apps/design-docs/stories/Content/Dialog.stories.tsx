import type { DialogProps } from '@brilliant/bds-core';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Dialog> = {
    title: 'Core/Content/Dialog',
    component: Dialog,
    tags: ['bds', 'content'],
    argTypes: {
        open: {
            options: [true, false] satisfies DialogProps['open'][],
            defaultValue: false,
            description: 'The controlled open state of the dialog.',
        },
        defaultOpen: {
            options: [true, false] satisfies DialogProps['open'][],
            defaultValue: false,
            description:
                'The open state of the dialog when it is initially rendered. Use when you do not need to control its open state.',
        },
        onOpenChange: {
            action: 'openChange',
            description:
                'Event handler called when the open state of the dialog changes.',
        },
        modal: {
            options: [true, false] satisfies DialogProps['modal'][],
            description:
                'The modality of the dialog. When set to true, interaction with outside elements will be disabled and only dialog content will be visible to screen readers.',
        },
    },
    args: {
        open: false,
        defaultOpen: false,
    },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Primary: Story = {
    render: () => {
        return (
            <div>
                <Dialog>
                    <DialogTrigger>
                        <Button>Open</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
        );
    },
};

export const WithFooter: Story = {
    render: () => {
        return (
            <div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Open</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save
                                when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div>Some content</div>
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                            <Button type="reset">Cancel</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    },
};

export const WithTitleIcon: Story = {
    render: () => {
        return (
            <div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Open</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle
                                titleIconColor="red"
                                titleIconName="bv:trash"
                            >
                                Delete profile
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the profile?
                            </DialogDescription>
                        </DialogHeader>
                        <div>Some content</div>
                        <DialogFooter>
                            <Button type="submit">Delete</Button>
                            <Button type="reset">Cancel</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    },
};
