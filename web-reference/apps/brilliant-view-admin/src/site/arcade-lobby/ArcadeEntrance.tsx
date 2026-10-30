import { AdventurePortrait } from './AdventurePortrait';

export function ArcadeEntrance({ onEnter }: { onEnter: () => void }) {
    return (
        <section
            className="arcade-entrance"
            aria-labelledby="arcade-entrance-title"
        >
            <p className="td-eyebrow">PLAYER ONE · READY WHEN YOU ARE</p>
            <h1 id="arcade-entrance-title">
                Delfoter <span>Arcade</span>
            </h1>
            <div className="arcade-entrance-mascot" aria-hidden="true">
                <span>✦</span>
                <AdventurePortrait />
                <span>✧</span>
            </div>
            <p>A little break. A whole ocean of adventure.</p>
            <button
                type="button"
                className="arcade-enter-button"
                onClick={onEnter}
            >
                <span aria-hidden="true">▶</span> Enter Arcade
            </button>
            <small>TINY PAWS. HIGH SCORES. ONE MORE GAME.</small>
        </section>
    );
}
