import { Toggle } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

const meta: Meta<typeof Toggle> = {
    title: 'Core/Inputs/Toggle',
    component: Toggle,
};

export default meta;

export const Default: StoryObj<typeof Toggle> = {
    render: () => (
        <DisplayContainer>
            <DisplayColumn>
                <Toggle size="sm" />
                <Toggle defaultChecked size="sm" />
                <Toggle disabled size="sm" />
            </DisplayColumn>
            <DisplayColumn>
                <Toggle
                    text="Email notifications"
                    supporting="Enable email notifications"
                    size="sm"
                />
                <Toggle
                    text="Email notifications"
                    supporting="Enable email notifications"
                    checked
                    size="sm"
                />
                <Toggle
                    text="Email notifications"
                    supporting="Enable email notifications"
                    disabled
                    size="sm"
                />
            </DisplayColumn>
            <DisplayColumn>
                <Toggle size="md" />
                <Toggle defaultChecked size="md" />
                <Toggle disabled size="md" />
            </DisplayColumn>
            <DisplayColumn>
                <Toggle
                    text="Email notifications"
                    supporting="Enable email notifications"
                    size="md"
                />
                <Toggle
                    text="Email notifications"
                    supporting="Enable email notifications"
                    defaultChecked
                    size="md"
                />
                <Toggle
                    text="Email notifications"
                    supporting="Enable email notifications"
                    disabled
                    size="md"
                />
            </DisplayColumn>
        </DisplayContainer>
    ),
};

export const WithText: StoryObj<typeof Toggle> = {
    render: () => (
        <div style={{ padding: '1rem', background: 'white' }}>
            <Toggle
                text="Email notifications"
                supporting="Enable email notifications"
            />
        </div>
    ),
};

export const Disabled: StoryObj<typeof Toggle> = {
    render: () => (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                padding: '1rem',
                background: 'white',
            }}
        >
            <Toggle disabled size="sm" />
            <Toggle checked disabled />
        </div>
    ),
};

function DisplayContainer({ children }: PropsWithChildren) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: 'var(--bg-primary)',
                padding: '1rem',
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
