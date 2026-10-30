export interface HighScoreStore {
    getHighScore(): Promise<number>;
    // Persist the score only if it beats the record; return the stored record.
    submitScore(score: number): Promise<number>;
}

const STORAGE_KEY = 'delfoter-adventure.high-score';

export class LocalStorageHighScoreStore implements HighScoreStore {
    constructor(
        private readonly getStorage: () => Pick<
            Storage,
            'getItem' | 'setItem'
        > = () => window.localStorage
    ) {}

    getHighScore(): Promise<number> {
        return Promise.resolve().then(() => this.readScore());
    }

    submitScore(score: number): Promise<number> {
        return Promise.resolve().then(() => {
            if (!Number.isSafeInteger(score) || score < 0)
                throw new RangeError('Invalid score');
            const best = Math.max(this.readScore(), score);
            this.getStorage().setItem(STORAGE_KEY, String(best));
            return best;
        });
    }

    private readScore(): number {
        const value = Number(this.getStorage().getItem(STORAGE_KEY));
        return Number.isSafeInteger(value) && value >= 0 ? value : 0;
    }
}

// Replace this adapter with an API implementation to change persistence.
export const defaultHighScoreStore: HighScoreStore =
    new LocalStorageHighScoreStore();
