import { APP_ROUTES } from '~/routes/routes';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DelfoterPortrait } from './Delfoter';
import { ENEMIES } from './enemies';
import { MAPS } from './maps';
import type { EnemyKind, GameMap, GameState } from './types';

export function RestartDialog({
    onRestart,
    onCancel,
}: {
    onRestart: () => void;
    onCancel: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const element = dialog.current;
        element?.showModal();
        return () => element?.close();
    }, []);
    return (
        <dialog
            ref={dialog}
            className="td-arena-menu td-restart-dialog"
            aria-labelledby="td-restart-heading"
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
        >
            <h2 id="td-restart-heading">Fresh start?</h2>
            <p className="td-menu-intro">
                This clears your current defense and starts a new run.
            </p>
            <footer>
                <button onClick={onRestart}>Restart run</button>
                <button
                    className="td-arena-primary"
                    autoFocus
                    onClick={onCancel}
                >
                    Keep playing
                </button>
            </footer>
        </dialog>
    );
}

export function GameMenu({
    game,
    onClose,
    onRestart,
    onMap,
}: {
    game: GameState;
    onClose: () => void;
    onRestart: () => void;
    onMap: (map: GameMap) => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const element = dialog.current;
        element?.showModal();
        return () => element?.close();
    }, []);
    return (
        <dialog
            ref={dialog}
            className="td-arena-menu"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            aria-labelledby="td-menu-heading"
        >
            <header>
                <div>
                    <span>TAKE A LITTLE BREATHER</span>
                    <h2 id="td-menu-heading">Reef headquarters</h2>
                </div>
                <button onClick={onClose} aria-label="Close game menu">
                    ✕
                </button>
            </header>
            <p className="td-menu-intro">
                Purchase a defender, then deploy it anywhere on clear grass.
                Keep the path free, protect the lighthouse, and upgrade between
                splashes. Survive 50 escalating waves. Build two rows between
                roads and use Upgrade &amp; sell to trade up to Big Spritz or
                Aqua-RPG.
            </p>
            <h3>Choose a map</h3>
            <div className="td-arena-map-select">
                {MAPS.map((map) => (
                    <button
                        key={map.id}
                        aria-pressed={game.map.id === map.id}
                        disabled={game.wave > 0 || game.towers.length > 0}
                        onClick={() => onMap(map)}
                    >
                        <strong>{map.name}</strong>
                        <small>{map.description}</small>
                    </button>
                ))}
            </div>
            <p className="td-menu-tip">
                Restart your run to switch maps after deploying.
            </p>
            <h3>Threat recognition</h3>
            <div className="td-arena-enemies">
                {(Object.keys(ENEMIES) as EnemyKind[]).map((kind) => (
                    <article key={kind}>
                        <DelfoterPortrait enemy={kind} />
                        <strong>{ENEMIES[kind].name}</strong>
                        <small className="td-enemy-properties">
                            {ENEMIES[kind].health} HP · {ENEMIES[kind].armor}{' '}
                            armor · {ENEMIES[kind].speed} speed
                        </small>
                        <p>{ENEMIES[kind].description}</p>
                    </article>
                ))}
            </div>
            <footer>
                <Link to={APP_ROUTES.delfoter_arcade}>← Arcade lobby</Link>
                <button onClick={onRestart}>Restart run…</button>
                <button className="td-arena-primary" onClick={onClose}>
                    Back to the reef
                </button>
            </footer>
        </dialog>
    );
}
