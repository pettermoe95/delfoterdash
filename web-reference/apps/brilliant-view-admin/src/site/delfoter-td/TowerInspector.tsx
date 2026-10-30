import { useEffect, useRef } from 'react';
import { DelfoterPortrait } from './Delfoter';
import { SELL_REFUND, sellValue } from './engine';
import { TOWERS, towerStats } from './towers';
import { TowerUpgrades } from './TowerUpgrades';
import type { GameState } from './types';

type Props = {
    game: GameState;
    selected: number;
    onSelect: (id: number | null) => void;
    onUpgrade: () => void;
    onSell: () => void;
};

export function TowerInspector({
    game,
    selected,
    onSelect,
    onUpgrade,
    onSell,
}: Props) {
    const panel = useRef<HTMLElement>(null);
    useEffect(() => {
        panel.current
            ?.querySelector<HTMLButtonElement>('button')
            ?.focus({ preventScroll: true });
    }, []);
    const tower = game.towers.find((item) => item.id === selected);
    const upgrade = tower && TOWERS[tower.kind].upgrades[tower.level];
    const finished = game.phase === 'won' || game.phase === 'lost';
    return (
        <aside
            ref={panel}
            className="td-defender-popup"
            aria-label="Defender upgrades and selling"
        >
            <header>
                <div>
                    <span>SPLASH WORKSHOP</span>
                    <strong>Upgrade & trade</strong>
                </div>
                <button
                    aria-label="Close defender panel"
                    onClick={() => onSelect(null)}
                >
                    ✕
                </button>
            </header>
            <div className="td-arena-inspector">
                <label htmlFor="td-defender-select">
                    SELECT A DEPLOYED DELFOTER
                </label>
                <select
                    id="td-defender-select"
                    value={selected ?? ''}
                    onChange={(event) =>
                        onSelect(
                            event.target.value
                                ? Number(event.target.value)
                                : null
                        )
                    }
                >
                    <option value="">Select a deployed friend</option>
                    {game.towers.map((item, index) => (
                        <option key={item.id} value={item.id}>
                            {index + 1}. {TOWERS[item.kind].name} · Lv{' '}
                            {item.level + 1}
                        </option>
                    ))}
                </select>
                {tower ? (
                    <>
                        <DelfoterPortrait tower={tower.kind} />
                        <h3 className="td-managed-name">
                            {TOWERS[tower.kind].name}
                        </h3>
                        <p>{TOWERS[tower.kind].description}</p>
                        <div className="td-inspector-stats">
                            <span>
                                <b>{towerStats(tower).damage}</b>DMG
                            </span>
                            <span>
                                <b>{towerStats(tower).range}</b>RANGE
                            </span>
                            <span>
                                <b>{towerStats(tower).cooldown}s</b>
                                RELOAD
                            </span>
                        </div>
                        <button
                            className="td-arena-primary"
                            disabled={
                                finished ||
                                !upgrade ||
                                game.coins < upgrade.cost
                            }
                            onClick={onUpgrade}
                        >
                            {upgrade
                                ? `${upgrade.name} · ◈ ${upgrade.cost}`
                                : `Max level ${'★'.repeat(tower.level + 1)}`}
                        </button>
                        <TowerUpgrades tower={tower} />
                        <div className="td-trade-in">
                            <strong>Trade up to a stronger friend</strong>
                            <p>
                                Sell for {Math.round(SELL_REFUND * 100)}% of the
                                purchase price and every upgrade. Shells return
                                immediately.
                            </p>
                            <button
                                className="td-sell-button"
                                disabled={finished}
                                onClick={() => {
                                    onSell();
                                }}
                            >
                                Sell defender · +◈ {sellValue(tower)}
                            </button>
                            <small>
                                After selling: ◈ {game.coins + sellValue(tower)}
                            </small>
                        </div>
                    </>
                ) : (
                    <p>
                        Click a Delfoter on the battlefield or choose one above
                        to upgrade or sell it.
                    </p>
                )}
            </div>
        </aside>
    );
}
