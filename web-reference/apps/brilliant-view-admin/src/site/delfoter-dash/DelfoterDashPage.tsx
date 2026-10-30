import { APP_ROUTES } from '~/routes/routes';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { DashCanvas } from './DashCanvas';
import { DashMenu } from './DashMenu';
import { progress } from './engine';
import type { DashLevel } from './types';
import { useDash } from './useDash';
import { worldFor } from './worlds';
import './dash.css';

export function DelfoterDashPage() {
    const controller = useDash();
    const { game, gameRef, begin, jump, phase, release, pause, choose } =
        controller;
    const world = worldFor(game.level);
    const viewport = useRef<HTMLElement>(null);
    const [notice, setNotice] = useState('');
    const focusCanvas = useCallback(
        () =>
            viewport.current
                ?.querySelector('canvas')
                ?.focus({ preventScroll: true }),
        []
    );
    const start = useCallback(
        (level: DashLevel) => {
            begin(level);
            focusCanvas();
        },
        [begin, focusCanvas]
    );
    const resume = () => {
        pause();
        focusCanvas();
    };
    useEffect(() => {
        const down = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (
                event.target instanceof Element &&
                event.target.closest('button,a,input,select,textarea')
            )
                return;
            if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
                event.preventDefault();
                if (!event.repeat) jump();
            } else if (
                !event.repeat &&
                ['KeyX', 'ShiftLeft', 'ShiftRight'].includes(event.code)
            ) {
                event.preventDefault();
                phase();
            } else if (
                !event.repeat &&
                (event.code === 'KeyP' || event.code === 'Escape')
            ) {
                event.preventDefault();
                pause();
            } else if (
                !event.repeat &&
                event.code === 'KeyR' &&
                gameRef.current.phase !== 'ready'
            ) {
                event.preventDefault();
                start(gameRef.current.level);
            }
        };
        const up = (event: KeyboardEvent) => {
            if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) release();
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, [gameRef, jump, phase, pause, release, start]);
    async function fullscreen() {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await viewport.current?.requestFullscreen();
            if (gameRef.current.phase === 'playing') focusCanvas();
        } catch {
            setNotice(
                'Fullscreen is unavailable. The course still plays in this window.'
            );
        }
    }
    return (
        <main
            ref={viewport}
            className="dash-page"
            aria-label="Delfoter Dash"
            data-world={world.theme}
            style={
                {
                    '--dash-accent': game.level.accent,
                    '--dash-secondary': game.level.secondary,
                } as CSSProperties
            }
        >
            <header className="dash-header">
                <div className="dash-brand">
                    <Link to={APP_ROUTES.delfoter_arcade}>← Arcade</Link>
                    <strong>
                        DELFOTER <em>DASH</em>
                        <span>GROUND SURF CLUB</span>
                    </strong>
                </div>
                <div className="dash-hud">
                    <div>
                        <span>
                            {world.name.toUpperCase()} · LEVEL{' '}
                            {game.level.number}
                        </span>
                        <b>{game.level.name}</b>
                    </div>
                    <div>
                        <span>ATTEMPT</span>
                        <b>{String(controller.attempt).padStart(2, '0')}</b>
                    </div>
                    <div>
                        <span>◈ SHELLS</span>
                        <b>
                            {game.shells.size}
                            <small> / {game.level.shells.length}</small>
                        </b>
                    </div>
                </div>
                <div className="dash-tools">
                    <button
                        onClick={() => {
                            controller.toggleMute();
                            if (game.phase === 'playing') focusCanvas();
                        }}
                        aria-pressed={controller.muted}
                        aria-label={
                            controller.muted
                                ? 'Unmute Dash audio'
                                : 'Mute Dash audio'
                        }
                    >
                        ♫ {controller.muted ? 'Muted' : 'Sound on'}
                    </button>
                    <button
                        disabled={
                            game.phase !== 'playing' && game.phase !== 'paused'
                        }
                        onClick={resume}
                    >
                        {game.phase === 'paused' ? '▶ Resume' : 'Ⅱ Pause'}
                    </button>
                    <button
                        onClick={() => void fullscreen()}
                        aria-label="Toggle fullscreen"
                    >
                        ⛶
                    </button>
                </div>
            </header>
            <div
                className="dash-progress"
                role="progressbar"
                aria-label="Course progress"
                aria-valuenow={progress(game)}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div style={{ width: `${progress(game)}%` }} />
            </div>
            <div className="dash-stage">
                <DashCanvas game={game} onJump={jump} onRelease={release} />
                {game.phase === 'playing' && (
                    <>
                        <div className="dash-live-label">
                            <span /> LIVE RUN <b>{progress(game)}%</b>
                        </div>
                        {world.ability === 'phase' && (
                            <button
                                className={`dash-phase-button ${game.elapsed < game.phaseUntil ? 'is-phasing' : ''}`}
                                disabled={game.elapsed < game.phaseReadyAt}
                                onClick={() => {
                                    phase();
                                    focusCanvas();
                                }}
                                aria-label="Phase through laser gates"
                            >
                                <span>
                                    {game.elapsed < game.phaseUntil
                                        ? 'PHASING'
                                        : game.elapsed < game.phaseReadyAt
                                          ? 'Charging…'
                                          : 'ϟ Phase'}
                                </span>
                                <small>SHIFT / X</small>
                                <i
                                    style={{
                                        width: `${Math.max(0, Math.min(1, 1 - (game.phaseReadyAt - game.elapsed) / 1.4)) * 100}%`,
                                    }}
                                />
                            </button>
                        )}
                        <span className="dash-bpm">
                            {game.level.bpm} BPM ·{' '}
                            {game.level.difficulty.toUpperCase()}
                        </span>
                    </>
                )}
                <DashMenu
                    game={game}
                    attempt={controller.attempt}
                    records={controller.records}
                    onChoose={choose}
                    onBegin={start}
                    onResume={resume}
                />
            </div>
            <footer className="dash-footer">
                <Link to={APP_ROUTES.customers}>← Back to admin panel</Link>
                <span>
                    {notice ||
                        (world.ability === 'phase'
                            ? 'Space / tap → jump · Ring + tap → boost · Shift / X / Phase → pass lasers'
                            : game.level.number >= 3
                              ? 'Space / click / tap → jump · Hold → chain · Tap the air ring over wide gaps'
                              : 'Space / click / tap → jump · Hold → chain · Blue pads launch you')}
                </span>
                <button onClick={() => choose(game.level)}>☷ Courses</button>
            </footer>
        </main>
    );
}
