import { Checkbox } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import type { PropsWithChildren } from 'react';

const meta: Meta<typeof Checkbox> = {
    title: 'Core/Inputs/Checkbox',
    component: Checkbox,
};

export default meta;

export const Default: StoryObj<typeof Checkbox> = {
    render: () => (
        <DisplayContainer>
            <DisplayColumn>
                <Checkbox defaultChecked size="sm" />
                <Checkbox size="sm" />
                <Checkbox size="sm" disabled />
                <Checkbox size="sm" defaultChecked disabled />
            </DisplayColumn>
            <DisplayColumn>
                <Checkbox
                    text="Email notifications"
                    supporting="Enable email notifications"
                    defaultChecked
                    size="sm"
                />
                <Checkbox
                    size="sm"
                    text="Indeterminate state"
                    checked="indeterminate"
                />
                <Checkbox
                    text="Email notifications"
                    supporting="Enable email notifications"
                    size="sm"
                />
                <Checkbox
                    text="Email notifications"
                    supporting="Enable email notifications"
                    size="sm"
                    disabled
                />
                <Checkbox
                    text="Email notifications"
                    supporting="Enable email notifications"
                    size="sm"
                    defaultChecked
                    disabled
                />
            </DisplayColumn>
            <DisplayColumn>
                <Checkbox defaultChecked />
                <Checkbox />
                <Checkbox disabled />
                <Checkbox defaultChecked disabled />
            </DisplayColumn>
            <DisplayColumn>
                <Checkbox
                    text="Email notifications"
                    supporting="Enable email notifications"
                />

                <Checkbox
                    defaultChecked
                    text="Email notifications"
                    supporting="Enable email notifications"
                />
                <Checkbox
                    text="Email notifications"
                    supporting="Enable email notifications"
                    disabled
                />
                <Checkbox
                    text="Email notifications"
                    supporting="Enable email notifications"
                    defaultChecked
                    disabled
                />
            </DisplayColumn>
        </DisplayContainer>
    ),
};

export const Disabled: StoryObj<typeof Checkbox> = {
    render: () => <Checkbox disabled />,
};

function DisplayContainer({ children }: PropsWithChildren) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-primary)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--border-radius-sm)',
            }}
        >
            {children}
        </div>
    );
}

function DisplayColumn({ children }: PropsWithChildren) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {children}
        </div>
    );
}
