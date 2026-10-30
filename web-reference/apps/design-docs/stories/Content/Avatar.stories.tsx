import type { AvatarSize } from '@brilliant/bds-core';
import { Avatar } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

const meta: Meta<typeof Avatar> = {
    title: 'Core/Content/Avatar',
    component: Avatar,
    tags: ['bds', 'content'],
};

export default meta;

type Story = StoryObj<typeof Avatar>;

const sizes = ['xs', 'sm', 'md', 'lg'] satisfies AvatarSize[];

export const Primary: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ font: 'var(----text-font-xl-medium)' }}>Light Mode</h2>
            <AvatarDisplayGroup>
                {sizes.map((size) => (
                    <Avatar
                        src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                        name="Jane Smith"
                        size={size}
                        key={size}
                    />
                ))}
            </AvatarDisplayGroup>

            <AvatarDisplayGroup>
                {sizes.map((size) => (
                    <Avatar name="John Smith" size={size} key={size} />
                ))}
            </AvatarDisplayGroup>
            <h2 style={{ font: 'var(----text-font-xl-medium)' }}>Dark Mode</h2>
            <AvatarDisplayGroup>
                {sizes.map((size) => (
                    <Avatar
                        src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                        name="Jane Smith"
                        size={size}
                        key={size}
                        data-theme="dark"
                    />
                ))}
            </AvatarDisplayGroup>
            <AvatarDisplayGroup>
                {sizes.map((size) => (
                    <Avatar
                        name="John Smith"
                        size={size}
                        key={size}
                        data-theme="dark"
                    />
                ))}
            </AvatarDisplayGroup>
        </div>
    ),
};

function AvatarDisplayGroup({ children }: PropsWithChildren) {
    return <div style={{ display: 'flex', gap: '1rem' }}>{children}</div>;
}
