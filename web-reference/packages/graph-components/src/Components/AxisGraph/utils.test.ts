import { describe, expect, it } from 'vitest';
import { formatDateLong } from './dateFormat';
import { tooltipLabelFormatter } from './utils';

describe('AxisGraph date localization', () => {
    it('formats ISO dates using norwegian locale', () => {
        expect(formatDateLong('2026-01-01', 'nb')).toBe('1. januar 2026');
    });

    it('formats compact dates using norwegian locale', () => {
        expect(formatDateLong('20260101', 'nb')).toBe('1. januar 2026');
    });

    it('formats tooltip date labels using provided locale', () => {
        expect(
            tooltipLabelFormatter('2026-01-01', 'date', undefined, 'nb')
        ).toBe('1. januar 2026');
    });
});
