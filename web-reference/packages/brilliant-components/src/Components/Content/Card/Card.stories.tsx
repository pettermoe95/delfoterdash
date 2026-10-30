import type { Meta, StoryObj } from '@storybook/react';

import { Card } from './Card';

const meta: Meta<typeof Card> = {
    title: 'Content/Card',
    component: Card,
};

export default meta;

export const Primary: StoryObj<typeof Card> = {
    render: () => (
        <Card header="Brilliant Card">
            <div>
                <p>Children inside card</p>
                <p>Children inside card</p>
                <p>Children inside card</p>
                <p>Children inside card</p>
            </div>
        </Card>
    ),
};

export const NoHeader: StoryObj<typeof Card> = {
    render: () => (
        <Card>
            <div>
                <p>Children inside card</p>
                <p>Children inside card</p>
                <p>Children inside card</p>
                <p>Children inside card</p>
            </div>
        </Card>
    ),
};
