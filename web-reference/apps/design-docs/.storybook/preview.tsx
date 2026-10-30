import '@brilliant/bds-core/styles.css';
import '@brilliant/components/style.css';
import '@bv/design-tokens/tokens.css';
import '@bv/ui/styles.css';
import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import './tailwind.css';

const preview: Preview = {
    globalTypes: {
        theme: { type: 'string' },
    },
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/']}>
                <div>
                    <Story />
                </div>
            </MemoryRouter>
        ),
    ],
};

export default preview;
