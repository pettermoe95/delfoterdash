import { describe, expect, it } from 'vitest';
import {
    getGradientConfig,
    getGraphLegendConfig,
    getGraphTypeDisplayConfig,
    getLegendColor,
} from './config';

describe('Theme Config Methods', () => {
    it('getGradientConfig returns expected config', () => {
        const result = getGradientConfig('blue');

        expect(result).toBeDefined();
        expect(result).toHaveProperty('from');
        expect(result).toHaveProperty('to');
        expect(result).toEqual({ from: '#577AD9', to: '#7794ED' });
    });

    it('getLegendColor returns expected color', () => {
        const result = getLegendColor({
            displayType: 'bar',
            color: '#000',
            relativeIndex: 0,
        });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        // Optionally check for a valid color format
        expect(result).toMatch(/^#|rgb|hsl/);
    });

    it('getGraphLegendConfig returns expected config', () => {
        const result = getGraphLegendConfig({
            name: 'Test Series',
            series: {
                values: [],
            },
            display: {
                legendIndex: 0,
                displayType: 'bar',
                color: 'blue',
            },
            hidden: false,
            index: 0,
            relativeIndex: 0,
            legendText: 'Test Series',
        });

        expect(result).toBeDefined();
        expect(result).toEqual({
            color: 'blue',
            legendIcon: 'mdi:square',
            offIcon: 'mdi:square-off-outline',
        });
    });

    it('getGraphTypeDisplayConfig returns expected config', () => {
        const result = getGraphTypeDisplayConfig({
            displayType: 'bar',
            color: '#000',
            relativeIndex: 0,
        });
        expect(result).toBeDefined();
        expect(result).toEqual({
            colors: [
                'blue',
                'teal',
                'yellow',
                'red',
                'purple',
                'pink',
                'green',
            ],
            icon: 'mdi:square',
            offIcon: 'mdi:square-off-outline',
        });
    });
});
