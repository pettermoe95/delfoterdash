import { dirname, join, resolve } from 'path';

function getAbsolutePath(value) {
    return dirname(require.resolve(join(value, 'package.json')));
}

const config = {
    stories: [
        '../stories/intro.stories.mdx',
        '../stories/*.stories.mdx',
        '../stories/*.stories.tsx',
        '../stories/**/*.stories.mdx',
        '../stories/**/*.stories.tsx',
        '../../brilliant-view/src/**/*.stories.@(js|jsx|ts|tsx)',
        '../../../packages/graph-components/src/**/*.stories.@(js|jsx|ts|tsx)',
        '../../../packages/brilliant-components/src/**/*.stories.@(js|jsx|ts|tsx)',
        '../../../packages/brilliant-view-ui/src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@storybook/addon-a11y'),
        getAbsolutePath('@storybook/addon-designs'),
        getAbsolutePath('@storybook/addon-interactions'),
        '@storybook/addon-themes',
    ],
    framework: {
        name: getAbsolutePath('@storybook/react-vite'),
        options: {},
    },

    core: {},

    async viteFinal(config, { configType }) {
        // customize the Vite config here
        return {
            ...config,
            define: { 'process.env': {} },
            resolve: {
                alias: [
                    {
                        find: 'ui',
                        replacement: resolve(
                            __dirname,
                            '../../../packages/brilliant-view-ui/'
                        ),
                    },
                    {
                        find: 'components',
                        replacement: resolve(
                            __dirname,
                            '../../../packages/brilliant-components/'
                        ),
                    },
                ],
            },
        };
    },

    docs: {
        autodocs: true,
    },
};

export default config;
