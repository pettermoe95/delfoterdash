import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, fn, within } from '@storybook/test';
import { SerieTypeAndColorPicker } from './SerieTypeAndColorPicker';

const meta = {
    component: SerieTypeAndColorPicker,
    title: 'View UI/SerieTypeAndColorPicker',
    parameters: {
        design: {
            type: 'figma',
            url: 'https://embed.figma.com/design/I4QfhZaAXexPG8SL9EAyM8/Brilliant-View-Design-System?node-id=3952-46668&m=dev&embed-host=share',
        },
    },
    argTypes: {
        onChangeHandler: {
            control: { type: 'function' },
            description: 'Handler for changes in the series configuration',
        },
        onTypeChangeHandler: {
            control: { type: 'function' },
            description: 'Handler for changes in the chart type',
        },
        onColorChangeHandler: {
            control: { type: 'function' },
            description: 'Handler for changes in the color selection',
        },
        onOpenChangeHandler: {
            control: { type: 'function' },
            description: 'Handler for changes in the open state of the picker',
        },
    },
} satisfies Meta<typeof SerieTypeAndColorPicker>;
export default meta;

type Story = StoryObj<typeof meta>;

// Wrapper component to use the hook correctly
export const Primary: Story = {
    args: {
        onChangeHandler: fn(),
        onTypeChangeHandler: fn(),
        onColorChangeHandler: fn(),
        onOpenChangeHandler: fn(),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.getAllByRole('button');

        for (const button of buttons) {
            await fireEvent.click(button);
        }
    },
};
