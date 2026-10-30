import type { CSSProperties } from 'react';
import { DelfoterPortrait } from './Delfoter';
import { TowerInspector } from './TowerInspector';
import { TOWERS } from './towers';
import type { GameState, TowerKind } from './types';

type Props = {
    game: GameState;
    selected: number | null;
    purchasing: TowerKind | null;
    onPurchase: (kind: TowerKind) => void;
    onCancel: () => void;
    onUpgrade: () => void;
    onSell: () => void;
    onSelect: (id: number | null) => void;
};
export function TowerShop({
    game,
    selected,
    purchasing,
    onPurchase,
    onCancel,
    onUpgrade,
    onSell,
    onSelect,
}: Props) {
    const finished = game.phase === 'won' || game.phase === 'lost';
    return (
        <>
            <aside className="td-arena-shop" aria-label="Defender shop">
                <div className="td-shop-heading">
                    <span>SPLASH SQUAD</span>
                    <strong>Recruit a friend</strong>
                </div>
                <div className="td-shop-scroll">
                    {(Object.keys(TOWERS) as TowerKind[]).map((kind) => (
                        <article
                            key={kind}
                            className={`td-buy-card ${purchasing === kind ? 'is-arming' : ''}`}
                            style={
                                {
                                    '--tower-color': TOWERS[kind].color,
                                } as CSSProperties
                            }
                        >
                            <DelfoterPortrait tower={kind} />
                            <div>
                                <h3>{TOWERS[kind].name}</h3>
                                <p>{TOWERS[kind].role}</p>
                                <button
                                    disabled={
                                        finished ||
                                        game.coins < TOWERS[kind].cost
                                    }
                                    onClick={() => onPurchase(kind)}
                                >
                                    {purchasing === kind
                                        ? 'Placing…'
                                        : 'Purchase'}{' '}
                                    <b>◈ {TOWERS[kind].cost}</b>
                                </button>
                                <small className="td-budget-gap">
                                    {game.coins < TOWERS[kind].cost
                                        ? `Need ${TOWERS[kind].cost - game.coins} more shells`
                                        : TOWERS[kind].upgrades.length === 3
                                          ? '3 upgrade stages'
                                          : 'Ready to deploy'}
                                </small>
                            </div>
                        </article>
                    ))}
                </div>
                <button
                    className="td-manage-squad"
                    disabled={!game.towers.length}
                    onClick={() => {
                        if (purchasing) onCancel();
                        onSelect(game.towers[0]?.id ?? null);
                    }}
                >
                    Upgrade & sell ({game.towers.length})
                </button>
                {purchasing && (
                    <div className="td-placement-help">
                        <strong>Choose clear grass</strong>
                        <p>Click to deploy. Shells are spent when placed.</p>
                        <button onClick={onCancel}>
                            Cancel <kbd>Esc</kbd>
                        </button>
                    </div>
                )}
            </aside>
            {selected !== null && !purchasing && (
                <TowerInspector
                    game={game}
                    selected={selected}
                    onSelect={onSelect}
                    onUpgrade={onUpgrade}
                    onSell={onSell}
                />
            )}
        </>
    );
}
