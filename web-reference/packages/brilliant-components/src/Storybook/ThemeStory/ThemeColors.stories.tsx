import type { Meta, StoryObj } from '@storybook/react';
import { useContext } from 'react';
import { ThemeContext } from '../../Theme/ThemeContext/ThemeContextWrapper';
import { Column, Row } from '../../Layout';
import type { VariationValue, ThemeColors } from '../../Theme/ThemeDefinition';

const ThemeDisplay = () => {
    const { theme } = useContext(ThemeContext);

    function colorBlock(key: string, color: string) {
        return (
            <Column>
                <Row
                    width="4em"
                    height="2em"
                    style={{ backgroundColor: color, border: `1px solid ${theme.colors.text.primary}` }}
                />
                <i>{key}</i>
            </Column>
        );
    }

    function renderVariation(name: string, variation: VariationValue) {
        const isStringVariation = typeof variation === 'string';
        return (
            <Row style={{ width: '35em' }}>
                <span style={{ width: '12em' }}>{name}</span>
                {isStringVariation
                    ? colorBlock('base', variation)
                    : Object.keys(variation).map((key) => {
                          return colorBlock(key, variation[key as keyof VariationValue]);
                      })}
            </Row>
        );
    }

    return (
        <Column>
            <h2 style={{ width: '100%', textAlign: 'left' }}>Theme Colors</h2>
            <br></br>
            <Row gap="l" wrap={true} justify="space-between">
                {Object.keys(theme.colors).map((key) => {
                    return renderVariation(key, theme.colors[key as keyof ThemeColors]);
                })}
            </Row>
        </Column>
    );
};

const meta: Meta<typeof ThemeDisplay> = {
    title: 'Theme/Colors',
    component: ThemeDisplay,
};

export default meta;

export const Colors: StoryObj<typeof ThemeDisplay> = {
    render: () => <ThemeDisplay />,
};
