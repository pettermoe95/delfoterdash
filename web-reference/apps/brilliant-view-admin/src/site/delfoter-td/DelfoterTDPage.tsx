import { APP_ROUTES } from '~/routes/routes';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Battlefield } from './Battlefield';
import {
    createGame,
    deployTower,
    sellTower,
    startWave,
    upgradeTower,
} from './engine';
import { GameMenu, RestartDialog } from './GameMenu';
import { TOWERS } from './towers';
import { TowerShop } from './TowerShop';
import type { GameMap, Point, TowerKind } from './types';
import { useTowerDefense } from './useTowerDefense';
import { WAVES } from './waves';
import './arcade.css';
import './arena.css';

export function DelfoterTDPage() {
    const [menu, setMenu] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const {
        game,
        gameRef,
        refresh,
        paused,
        setPaused,
        speed,
        setSpeed,
        sound,
        toggleSound,
    } = useTowerDefense(menu || confirmReset);
    const [purchasing, setPurchasing] = useState<TowerKind | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [notice, setNotice] = useState(
        'Your reef. Your rules. Purchase a defender to start building.'
    );
    const viewport = useRef<HTMLDivElement>(null);
    const finished = game.phase === 'won' || game.phase === 'lost';
    const displayedWave = game.phase === 'build' ? game.wave + 1 : game.wave;
    const wave = WAVES[game.phase === 'build' ? game.wave : game.wave - 1];

    function cancelPurchase() {
        setPurchasing(null);
        setNotice('Purchase cancelled. No shells spent.');
    }
    useEffect(() => {
        if (!purchasing && selected === null) return;
        const cancel = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (purchasing) cancelPurchase();
                setSelected(null);
                viewport.current
                    ?.querySelector('canvas')
                    ?.focus({ preventScroll: true });
            }
        };
        window.addEventListener('keydown', cancel);
        return () => window.removeEventListener('keydown', cancel);
    }, [purchasing, selected]);
    useEffect(() => {
        if (finished) setPurchasing(null);
    }, [finished]);

    function purchase(kind: TowerKind) {
        if (finished || game.coins < TOWERS[kind].cost) return;
        setPurchasing(kind);
        setSelected(null);
        setNotice(
            `${TOWERS[kind].name}: choose clear grass to deploy. Click to confirm, Esc to cancel.`
        );
        // Keep keyboard placement one Tab away from Purchase; pointer placement needs no extra clicks.
        viewport.current
            ?.querySelector('canvas')
            ?.focus({ preventScroll: true });
    }
    function place(position: Point) {
        if (!purchasing || finished) return;
        const id = deployTower(game, purchasing, position);
        if (id === null) {
            setNotice(
                'Can’t deploy here. Leave space around the path, other defenders, and the lighthouse.'
            );
            return;
        }
        setSelected(null);
        setPurchasing(null);
        setNotice(`${TOWERS[purchasing].name} is ready. Let’s make a splash!`);
        refresh();
    }
    function reset(map: GameMap = game.map) {
        gameRef.current = createGame(map);
        setSelected(null);
        setPurchasing(null);
        setPaused(false);
        setConfirmReset(false);
        setNotice('Fresh water. Fresh start. Build a better splash squad.');
        refresh();
    }
    async function fullscreen() {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await viewport.current?.requestFullscreen();
        } catch {
            setNotice(
                'Fullscreen is unavailable in this browser. You can still play in the game window.'
            );
        }
    }
    return (
        <section className="td-play-page" aria-label="Delfoter TD: AI Takeover">
            <div
                className="td-arena-viewport"
                data-map={game.map.id}
                ref={viewport}
            >
                <div className="td-arena-stage">
                    <Battlefield
                        game={game}
                        selected={selected}
                        purchasing={purchasing}
                        paused={paused || menu || confirmReset}
                        onPlace={place}
                        onSelect={setSelected}
                    />
                    <header className="td-arena-hud">
                        <div className="td-arena-brand">
                            <Link to={APP_ROUTES.customers}>
                                ← Back to admin panel
                            </Link>
                            <h1>
                                DELFOTER <em>TD</em>
                                <span>AI TAKEOVER</span>
                            </h1>
                        </div>
                        <div className="td-arena-counters">
                            <div className="td-health">
                                <span>♥ REEF</span>
                                <strong>
                                    {game.lives}
                                    <small>/20</small>
                                </strong>
                            </div>
                            <div className="td-shells">
                                <span>◈ SHELLS</span>
                                <strong>{game.coins}</strong>
                            </div>
                            <div
                                className="td-current-wave"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                <span>
                                    {game.phase === 'build'
                                        ? 'NEXT WAVE'
                                        : game.phase === 'won'
                                          ? 'WAVES CLEARED'
                                          : 'CURRENT WAVE'}
                                </span>
                                <strong>
                                    {displayedWave}
                                    <small> / {WAVES.length}</small>
                                </strong>
                            </div>
                            <div>
                                <span>⚡ FRIED</span>
                                <strong>{game.kills}</strong>
                            </div>
                        </div>
                        <div className="td-arena-tools">
                            <button
                                aria-pressed={sound}
                                onClick={() => void toggleSound()}
                            >
                                ♫ {sound ? 'Sound on' : 'Sound off'}
                            </button>
                            <button
                                onClick={() =>
                                    setSpeed(speed === 8 ? 1 : speed * 2)
                                }
                                title="Change speed: 1× → 2× → 4× → 8×"
                                aria-label={`Game speed ${speed} times`}
                            >
                                {speed}×
                            </button>
                            <button
                                onClick={() => setPaused(!paused)}
                                disabled={game.phase !== 'wave'}
                            >
                                {paused ? '▶ Resume' : 'Ⅱ Pause'}
                            </button>
                            <button
                                onClick={() => void fullscreen()}
                                aria-label="Toggle fullscreen"
                            >
                                ⛶
                            </button>
                            <button onClick={() => setMenu(true)}>
                                ☰ Menu
                            </button>
                        </div>
                    </header>
                    <div className="td-arena-map-label">
                        <span className="td-live-dot" />
                        {game.map.name}
                        <span>
                            {paused && game.phase === 'wave'
                                ? 'PAUSED'
                                : game.phase === 'wave'
                                  ? 'UNDER ATTACK'
                                  : 'REEF DEFENSE'}
                        </span>
                    </div>
                    <TowerShop
                        game={game}
                        selected={selected}
                        purchasing={purchasing}
                        onPurchase={purchase}
                        onCancel={cancelPurchase}
                        onSelect={(id) => {
                            setSelected(id);
                            if (id === null)
                                viewport.current
                                    ?.querySelector('canvas')
                                    ?.focus({ preventScroll: true });
                        }}
                        onUpgrade={() => {
                            if (
                                selected !== null &&
                                upgradeTower(game, selected)
                            ) {
                                setNotice(
                                    'New gear. Bigger splashes. Same adorable paws.'
                                );
                                refresh();
                            }
                        }}
                        onSell={() => {
                            if (selected !== null) {
                                const refund = sellTower(game, selected);
                                setNotice(
                                    `Sold! ${refund} shells returned. Choose your next defender from the shop.`
                                );
                                setSelected(null);
                                refresh();
                            }
                        }}
                    />
                    <footer className="td-arena-wave">
                        <div>
                            <span>
                                {game.phase === 'build'
                                    ? `NEXT WAVE ${displayedWave} OF ${WAVES.length}`
                                    : `WAVE ${displayedWave} OF ${WAVES.length}`}
                            </span>
                            <strong>
                                {game.phase === 'build'
                                    ? 'Ready when you are'
                                    : (wave?.name ?? 'All circuits soaked')}
                            </strong>
                            <small>
                                {game.phase === 'wave'
                                    ? `${game.enemies.length} on the path · ${game.pending.length} incoming`
                                    : 'Every wave cleared earns bonus shells.'}
                            </small>
                        </div>
                        <button
                            className="td-arena-primary"
                            disabled={game.phase !== 'build'}
                            onClick={() => {
                                if (startWave(game)) {
                                    setPaused(false);
                                    refresh();
                                }
                            }}
                        >
                            ▶ {game.wave ? 'Send next wave' : 'Start invasion'}
                        </button>
                    </footer>
                    <div className="td-arena-notice" role="status">
                        <span>✦</span>
                        {notice}
                    </div>
                    <div className="td-arena-bottom">
                        <span>WATER &gt; CIRCUITS</span>
                        <span>
                            Purchase → aim → deploy · Esc cancels · Arrow keys +
                            Enter supported
                        </span>
                    </div>
                    {paused &&
                        game.phase === 'wave' &&
                        !menu &&
                        !confirmReset && (
                            <div className="td-arena-pause">
                                <strong>TAKING A BREATHER</strong>
                                <button onClick={() => setPaused(false)}>
                                    ▶ Back to splashing
                                </button>
                            </div>
                        )}
                    {finished && (
                        <div className="td-arena-end">
                            <span>
                                {game.phase === 'won'
                                    ? '✧ REEF SAVED ✧'
                                    : 'CONNECTION LOST'}
                            </span>
                            <h2>
                                {game.phase === 'won'
                                    ? 'Takeover: uninstalled.'
                                    : 'They reached the lighthouse.'}
                            </h2>
                            <p>
                                {game.phase === 'won'
                                    ? 'Big hearts. Tiny paws. An ocean of very wet robots.'
                                    : 'Try slowing the runners and sniping the armored bots. The reef believes in you.'}
                            </p>
                            <button
                                className="td-arena-primary"
                                onClick={() => reset()}
                            >
                                ↻ Play again
                            </button>
                            <button onClick={() => setMenu(true)}>
                                Maps & field guide
                            </button>
                        </div>
                    )}
                    {menu && (
                        <GameMenu
                            game={game}
                            onClose={() => setMenu(false)}
                            onMap={(map) => reset(map)}
                            onRestart={() => {
                                setMenu(false);
                                setConfirmReset(true);
                            }}
                        />
                    )}
                    {confirmReset && (
                        <RestartDialog
                            onRestart={() => {
                                reset();
                                setMenu(true);
                            }}
                            onCancel={() => setConfirmReset(false)}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
