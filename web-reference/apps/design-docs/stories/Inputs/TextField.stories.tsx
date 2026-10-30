import type { TextFieldSize } from '@brilliant/bds-core';
import { TextField } from '@brilliant/bds-core';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TextField> = {
    title: 'Core/Inputs/TextField',
    component: TextField,
};

export default meta;

const sizes = ['sm', 'md'] satisfies TextFieldSize[];

export const Default: StoryObj<typeof TextField> = {
    render: () => {
        return (
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                }}
            >
                {sizes.map((size) => (
                    <>
                        <h1
                            style={{
                                gridColumn: 'span 2',
                                font: 'var(--display-font-md-medium)',
                            }}
                        >
                            Size: {size}
                        </h1>
                        <>
                            <TextField
                                id={['email-1', size].join('-')}
                                name="Email"
                                label="Email"
                                placeholder="firstname@company.com"
                                supportingText="Supporting text to help the user."
                                size={size}
                                copyable
                            />
                            <TextField
                                id={['email-2', size].join('-')}
                                name="Email"
                                label="Email"
                                placeholder="firstname@company.com"
                                supportingText="Supporting text to help the user."
                                size={size}
                                info="Some extra information about this input field"
                                disabled
                            />
                            <TextField
                                id={['email-3', size].join('-')}
                                name="Email"
                                label="Email"
                                leftIcon="mdi:email-outline"
                                placeholder="firstname@company.com"
                                supportingText="Supporting text to help the user."
                                size={size}
                            />
                            <TextField
                                id={['email-4', size].join('-')}
                                name="Email"
                                leftIcon="mdi:email-outline"
                                label="Email"
                                value="firstname@company.com"
                                supportingText="Supporting text to help the user."
                                size={size}
                                copyable
                                disabled
                            />
                            <TextField
                                id={['email-5', size].join('-')}
                                name="Email"
                                leftIcon="mdi:email-outline"
                                label="Email"
                                placeholder="firstname@company.com"
                                supportingText="Supporting text to help the user."
                                size={size}
                                info="Some extra information about this input field"
                                error
                            />
                        </>
                    </>
                ))}
            </div>
        );
    },
};
