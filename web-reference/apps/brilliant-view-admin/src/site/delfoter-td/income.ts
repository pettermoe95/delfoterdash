import type { GameState } from './types';

export const SHELL_INCOME_PERCENT = 80;

// Carry fractional shells forward so many small kills still pay exactly 20% less overall.
export function awardIncome(game: GameState, baseReward: number) {
    const scaled =
        baseReward * SHELL_INCOME_PERCENT + (game.incomeRemainder ?? 0);
    const earned = Math.floor(scaled / 100);
    game.incomeRemainder = scaled % 100;
    game.coins += earned;
    return earned;
}
