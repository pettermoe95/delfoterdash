import { APP_ROUTES } from '~/routes/routes';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdventurePortrait } from './arcade-lobby/AdventurePortrait';
import { ArcadeEntrance } from './arcade-lobby/ArcadeEntrance';
import { MusicToggle } from './arcade-lobby/MusicToggle';
import { PixelBackdrop } from './arcade-lobby/PixelBackdrop';
import { useArcadeMusic } from './arcade-lobby/useArcadeMusic';
import { DashPortrait } from './delfoter-dash/DashPortrait';
import { DelfoterPortrait } from './delfoter-td/Delfoter';
import './delfoter-td/arcade.css';
import { ENEMIES } from './delfoter-td/enemies';
import { MAPS } from './delfoter-td/maps';
import { TOWERS } from './delfoter-td/towers';
import { WAVES } from './delfoter-td/waves';

export function DelfoterArcadePage() {
    const [entered, setEntered] = useState(false);
    const music = useArcadeMusic();
    const firstGame = useRef<HTMLAnchorElement>(null);
    useEffect(() => {
        if (entered) firstGame.current?.focus({ preventScroll: true });
    }, [entered]);
    return (
        <main className="arcade-lobby-page">
            <PixelBackdrop />
            <header className="arcade-lobby-header">
                <Link to={APP_ROUTES.customers}>← Back to admin panel</Link>
                {entered && <MusicToggle music={music} />}
            </header>
            {!entered ? (
                <ArcadeEntrance
                    onEnter={() => {
                        music.enter();
                        setEntered(true);
                    }}
                />
            ) : (
                <section className="td-lobby">
                    <p className="td-eyebrow">
                        PLAYER ONE · YOUR BREAK STARTS HERE
                    </p>
                    <h1>
                        Delfoter <span>Arcade</span>
                        <b aria-hidden="true">✦</b>
                    </h1>
                    <h2>
                        Choose your <span>next adventure.</span>
                    </h2>
                    <p>
                        Half otter. Half dolphin. Entirely ready for your next
                        adventure.
                    </p>
                    <div className="td-game-cards">
                        <Link
                            ref={firstGame}
                            to={APP_ROUTES.delfoter_adventure}
                            className="td-game-card td-adventure-card"
                        >
                            <div className="td-card-art">
                                <span className="td-art-bubble">✦</span>
                                <AdventurePortrait />
                                <span className="td-art-bubble">✧</span>
                            </div>
                            <div className="td-card-copy">
                                <p className="td-eyebrow">
                                    THE ORIGINAL · ENDLESS RUNNER
                                </p>
                                <h3>Delfoter Adventure</h3>
                                <p>
                                    A tiny swimmer in a big ocean. Hop over
                                    coral, dodge curious creatures, and snack on
                                    glowing starfish.
                                </p>
                                <span className="td-card-tags">
                                    One brave Delfoter · One more try
                                </span>
                                <strong>Start swimming →</strong>
                            </div>
                        </Link>
                        <Link
                            to={APP_ROUTES.delfoter_td}
                            className="td-game-card td-takeover-card"
                        >
                            <div className="td-card-art">
                                <span className="td-new">NEW GAME</span>
                                <DelfoterPortrait tower="soaker" />
                                <span className="td-versus">VS</span>
                                <DelfoterPortrait enemy="overlord" />
                            </div>
                            <div className="td-card-copy">
                                <p className="td-eyebrow">
                                    STRATEGY · TOWER DEFENSE
                                </p>
                                <h3>Delfoter TD: AI Takeover</h3>
                                <p>
                                    The robots forgot one tiny detail: water and
                                    circuits don’t mix. Assemble your splash
                                    squad and defend the reef.
                                </p>
                                <span className="td-card-tags">
                                    {Object.keys(TOWERS).length} defenders ·{' '}
                                    {Object.keys(ENEMIES).length} robots ·{' '}
                                    {MAPS.length} maps · {WAVES.length} waves
                                </span>
                                <strong>Defend the reef →</strong>
                            </div>
                        </Link>
                        <Link
                            to={APP_ROUTES.delfoter_dash}
                            className="td-game-card td-dash-card"
                        >
                            <div className="td-card-art">
                                <span className="td-new">NEW RIDE</span>
                                <DashPortrait />
                                <span
                                    className="dash-card-bolt"
                                    aria-hidden="true"
                                >
                                    ϟ
                                </span>
                            </div>
                            <div className="td-card-copy">
                                <p className="td-eyebrow">
                                    RHYTHM · NEON SURFING
                                </p>
                                <h3>Delfoter Dash</h3>
                                <p>
                                    A cool board. A glowing city. Jump spikes,
                                    ride the beat, and surf the ground like the
                                    ocean owes you a favor.
                                </p>
                                <span className="td-card-tags">
                                    2 worlds · 10 levels · Phase gates ·
                                    Original beats
                                </span>
                                <strong>Find your flow →</strong>
                            </div>
                        </Link>
                    </div>
                    <p className="td-footer">
                        TINY PAWS. HIGH SCORES. ONE MORE GAME.
                    </p>
                </section>
            )}
        </main>
    );
}
