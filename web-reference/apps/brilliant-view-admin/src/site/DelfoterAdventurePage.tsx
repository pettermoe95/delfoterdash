import { AdminPageLayout } from '~/layout/AdminPageLayout';
import { APP_ROUTES } from '~/routes/routes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { drawDelfoter } from './delfoter/drawDelfoter';
import {
    advanceGame,
    canRestart,
    createGame,
    GAME_HEIGHT,
    GAME_WIDTH,
    GROUND_Y,
    obstacleY,
    PLAYER_X,
    starfishY,
} from './delfoter/game';
import type { GameState, GameStatus, Obstacle } from './delfoter/game';
import { defaultHighScoreStore } from './delfoter/highScores';
import type { HighScoreStore } from './delfoter/highScores';

function drawSeaCreature(
    context: CanvasRenderingContext2D,
    obstacle: Obstacle,
    elapsed: number
) {
    const x = Math.round(obstacle.x);
    const y = obstacleY(obstacle, elapsed);
    if (obstacle.kind === 'jellyfish') {
        context.fillStyle = '#a685dd';
        context.fillRect(x + 8, y, 28, 8);
        context.fillRect(x + 4, y + 8, 36, 12);
        context.fillRect(x, y + 20, 44, 8);
        context.fillStyle = '#d8bcf3';
        context.fillRect(x + 12, y + 4, 12, 8);
        for (let index = 0; index < 4; index += 1) {
            const sway = Math.round(Math.sin(elapsed * 4 + index) * 3);
            context.fillRect(x + 5 + index * 10, y + 28, 4, 10);
            context.fillRect(x + 5 + index * 10 + sway, y + 38, 4, 10);
        }
    } else {
        context.fillStyle = '#e9ac59';
        context.fillRect(x + 8, y + 4, 32, 28);
        context.fillRect(x + 4, y + 8, 40, 20);
        context.fillStyle = '#f6d39a';
        context.fillRect(x + 12, y + 20, 24, 8);
        context.fillStyle = '#cf8b42';
        context.fillRect(x + 12, y, 4, 4);
        context.fillRect(x + 28, y, 4, 4);
        context.fillRect(x, y + 16, 4, 4);
        context.fillRect(x + 44, y + 12, 4, 12);
        context.fillRect(x + 16, y + 32, 4, 4);
        context.fillRect(x + 32, y + 32, 4, 4);
    }
    context.fillStyle = '#35475c';
    context.fillRect(x + 12, y + 15, 4, 4);
    context.fillRect(x + 26, y + 15, 4, 4);
    context.fillRect(x + 20, y + 22, 4, 2);
}

function drawCoral(context: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = Math.round(obstacle.x);
    const top = obstacle.y;
    context.fillStyle = '#ea806f';
    context.fillRect(x + 12, top + 14, 20, obstacle.height - 14);
    context.fillRect(x + 4, top + 26, 12, 15);
    context.fillRect(x + 27, top + 5, 12, 18);
    context.fillStyle = '#f7ac83';
    context.fillRect(x + 12, top + 8, 8, 8);
    context.fillRect(x + 31, top, 8, 8);
    context.fillRect(x + 4, top + 20, 8, 8);
    context.fillStyle = '#c65f61';
    context.fillRect(x + 16, top + 18, 5, 5);
    context.fillRect(x + 29, top + 28, 5, 5);
}

function drawCeiling(context: CanvasRenderingContext2D, obstacle: Obstacle) {
    const x = Math.round(obstacle.x);
    context.fillStyle = '#426277';
    context.fillRect(x, 0, obstacle.width, obstacle.height - 16);
    context.fillRect(x + 8, obstacle.height - 16, obstacle.width - 16, 16);
    context.fillStyle = '#648b99';
    context.fillRect(x + 8, 0, 12, obstacle.height - 24);
    context.fillStyle = '#284c63';
    for (let y = 28; y < obstacle.height - 16; y += 32) {
        context.fillRect(x + 28, y, obstacle.width - 28, 6);
    }
    context.fillStyle = '#91b99b';
    context.fillRect(x + 8, obstacle.height - 20, obstacle.width - 16, 4);
}

const starfishPixels = [
    '.....s.....',
    '....sss....',
    '....sss....',
    'sssssssssss',
    '.sssssssss.',
    '..sssssss..',
    '...sssss...',
    '..sss.sss..',
    '..ss...ss..',
    '.ss.....ss.',
];

function drawStarfish(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    elapsed: number,
    scale = 1
) {
    context.save();
    context.translate(Math.round(x), Math.round(y));
    context.scale(scale, scale);
    context.shadowColor = '#ffe99a';
    context.shadowBlur = 14 + Math.sin(elapsed * 6) * 4;
    context.fillStyle = '#ffc95f';
    starfishPixels.forEach((row, rowIndex) => {
        [...row].forEach((pixel, columnIndex) => {
            if (pixel === 's')
                context.fillRect(columnIndex * 3 - 16, rowIndex * 3 - 15, 3, 3);
        });
    });
    context.shadowBlur = 0;
    context.fillStyle = '#fff3bb';
    context.fillRect(-4, -5, 6, 3);
    context.fillRect(-1, -11, 3, 3);
    context.fillStyle = '#95633d';
    context.fillRect(-5, 1, 2, 2);
    context.fillRect(4, 1, 2, 2);
    context.restore();
}

function drawPlayer(context: CanvasRenderingContext2D, game: GameState) {
    const y = Math.round(game.playerY);
    const glowing = game.elapsed < game.glowUntil;
    context.save();
    if (glowing) {
        const halo = context.createRadialGradient(
            PLAYER_X + 70,
            y + 20,
            8,
            PLAYER_X + 70,
            y + 20,
            95
        );
        halo.addColorStop(0, 'rgba(255, 241, 162, 0.5)');
        halo.addColorStop(1, 'rgba(255, 241, 162, 0)');
        context.fillStyle = halo;
        context.fillRect(PLAYER_X - 30, y - 75, 200, 190);
        context.shadowColor = '#fff4a6';
        context.shadowBlur = 12;
    }
    const eatingAge = game.eating
        ? game.elapsed - game.eating.startedAt
        : Infinity;
    drawDelfoter(context, PLAYER_X, y, game.elapsed, eatingAge < 0.85);
    context.restore();

    if (glowing) {
        context.fillStyle = '#fff7bc';
        for (let index = 0; index < 7; index += 1) {
            const phase = game.elapsed * 3 + index * 2;
            const x = PLAYER_X + 12 + index * 14;
            const sparkleY = y + 15 + Math.sin(phase) * 30;
            context.fillRect(x, sparkleY, 3, 3);
            context.fillRect(x - 2, sparkleY + 1, 7, 1);
        }
    }
    if (game.eating && eatingAge < 0.35) {
        const progress = eatingAge / 0.35;
        drawStarfish(
            context,
            PLAYER_X + 111 + game.eating.offsetX * (1 - progress),
            y + 23 + game.eating.offsetY * (1 - progress),
            game.elapsed,
            1 - progress * 0.95
        );
    }
    if (eatingAge < 1.2) {
        context.save();
        context.globalAlpha = 1 - eatingAge / 1.2;
        context.fillStyle = '#fff3ad';
        context.font = 'bold 20px monospace';
        context.textAlign = 'center';
        context.fillText('+5', PLAYER_X + 100, y - 8 - eatingAge * 26);
        context.restore();
    }
}

function drawGame(
    context: CanvasRenderingContext2D,
    game: GameState,
    highScore: number
) {
    context.imageSmoothingEnabled = false;
    context.fillStyle = '#8be4e9';
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Sunlit surface and layered water bands.
    context.fillStyle = '#b6f5e8';
    context.fillRect(0, 0, GAME_WIDTH, 76);
    context.fillStyle = '#69cbd8';
    context.fillRect(0, 76, GAME_WIDTH, 130);
    context.fillStyle = '#43b4c9';
    context.fillRect(0, 206, GAME_WIDTH, 124);
    context.fillStyle = '#3196b7';
    context.fillRect(0, 330, GAME_WIDTH, 84);

    context.fillStyle = 'rgba(255,255,255,0.45)';
    for (let index = 0; index < 9; index += 1) {
        const x = (index * 117 - game.elapsed * 34) % (GAME_WIDTH + 50);
        const waveX = x < -24 ? x + GAME_WIDTH + 50 : x;
        const y = 97 + (index % 3) * 42;
        context.fillRect(waveX, y, 30, 4);
        context.fillRect(waveX + 8, y - 4, 20, 4);
    }

    // Bubbles drift upward behind the player.
    for (let index = 0; index < 7; index += 1) {
        const x = (index * 137 + 58) % GAME_WIDTH;
        const y = 90 + ((((index * 71 - game.elapsed * 22) % 260) + 260) % 260);
        context.fillStyle = 'rgba(239,255,250,0.65)';
        context.fillRect(x, y, 5, 5);
        context.fillRect(x - 3, y + 5, 3, 5);
        context.fillRect(x + 5, y + 5, 3, 5);
    }

    // Sandy seabed and little sea grass.
    context.fillStyle = '#e9cf91';
    context.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    context.fillStyle = '#d4b977';
    context.fillRect(0, GROUND_Y, GAME_WIDTH, 8);
    for (let index = 0; index < 14; index += 1) {
        const x = (index * 67 - game.elapsed * 55) % (GAME_WIDTH + 30);
        const grassX = x < -12 ? x + GAME_WIDTH + 30 : x;
        context.fillStyle = index % 2 ? '#538c70' : '#6c9b6c';
        context.fillRect(grassX, GROUND_Y - 14, 4, 14);
        context.fillRect(grassX - 5, GROUND_Y - 10, 5, 4);
    }

    game.obstacles.forEach((obstacle) => {
        if (obstacle.kind === 'coral') drawCoral(context, obstacle);
        else if (obstacle.kind === 'ceiling') drawCeiling(context, obstacle);
        else drawSeaCreature(context, obstacle, game.elapsed);
    });
    game.starfish.forEach((starfish) =>
        drawStarfish(
            context,
            starfish.x,
            starfishY(starfish, game.elapsed),
            game.elapsed
        )
    );
    drawPlayer(context, game);

    context.fillStyle = '#ffffff';
    context.font = 'bold 28px monospace';
    context.textAlign = 'left';
    context.fillText(`SCORE ${game.score.toString().padStart(2, '0')}`, 24, 42);
    context.textAlign = 'right';
    context.fillText(`BEST ${highScore}`, GAME_WIDTH - 24, 42);

    if (game.status !== 'playing') {
        context.fillStyle = 'rgba(14, 63, 91, 0.74)';
        context.fillRect(170, 144, 460, 150);
        context.strokeStyle = '#eafff5';
        context.lineWidth = 4;
        context.strokeRect(170, 144, 460, 150);
        context.textAlign = 'center';
        context.fillStyle = '#fff8df';
        context.font = 'bold 30px monospace';
        context.fillText(
            game.status === 'ready' ? 'DELFOTER ADVENTURE' : 'SPLASH!',
            GAME_WIDTH / 2,
            196
        );
        context.font = 'bold 17px monospace';
        context.fillText(
            game.status === 'ready'
                ? 'TAP OR PRESS SPACE TO SWIM'
                : canRestart(game)
                  ? 'TAP OR PRESS SPACE TO TRY AGAIN'
                  : 'TAKE A BREATH…',
            GAME_WIDTH / 2,
            235
        );
        if (game.status === 'over') {
            context.fillText(`FINAL SCORE: ${game.score}`, GAME_WIDTH / 2, 267);
        }
    }
}

function playTone(
    context: AudioContext,
    frequency: number,
    duration: number,
    volume: number,
    delay = 0
) {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(100, frequency * 1.22),
        start + duration * 0.72
    );
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
}

export function DelfoterAdventurePage({
    highScoreStore = defaultHighScoreStore,
}: {
    highScoreStore?: HighScoreStore;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<GameState>(createGame());
    const audioContextRef = useRef<AudioContext | null>(null);
    const musicTimerRef = useRef<number | undefined>(undefined);
    const musicEnabledRef = useRef(true);
    const highScoreRef = useRef(0);
    const [status, setStatus] = useState<GameStatus>('ready');
    const [score, setScore] = useState(0);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [highScore, setHighScore] = useState(0);
    const [scoreStorageError, setScoreStorageError] = useState(false);
    const [restartReady, setRestartReady] = useState(true);

    useEffect(() => {
        let active = true;
        void highScoreStore
            .getHighScore()
            .then((saved) => {
                if (!active) return;
                highScoreRef.current = Math.max(highScoreRef.current, saved);
                setHighScore(highScoreRef.current);
                setScoreStorageError(false);
            })
            .catch(() => {
                if (active) setScoreStorageError(true);
            });
        return () => {
            active = false;
        };
    }, [highScoreStore]);

    useEffect(() => {
        if (status !== 'over') return;
        let active = true;
        void highScoreStore
            .submitScore(score)
            .then((saved) => {
                if (!active) return;
                highScoreRef.current = Math.max(highScoreRef.current, saved);
                setHighScore(highScoreRef.current);
                setScoreStorageError(false);
            })
            .catch(() => {
                if (active) setScoreStorageError(true);
            });
        return () => {
            active = false;
        };
    }, [highScoreStore, status, score]);

    const ensureAudio = useCallback((): AudioContext => {
        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext();
        }
        const audio = audioContextRef.current;
        if (audio.state === 'suspended') {
            void audio.resume();
        }
        return audio;
    }, []);

    const stopMusic = useCallback(() => {
        if (musicTimerRef.current !== undefined) {
            window.clearInterval(musicTimerRef.current);
            musicTimerRef.current = undefined;
        }
    }, []);

    const startMusic = useCallback(() => {
        if (!musicEnabledRef.current || musicTimerRef.current !== undefined) {
            return;
        }
        const audio = ensureAudio();
        const melody = [523, 659, 784, 659, 587, 698, 880, 698];
        let note = 0;
        const playNextNote = () => {
            const frequency = melody[note % melody.length];
            note += 1;
            playTone(audio, frequency, 0.24, 0.018);
        };
        playNextNote();
        musicTimerRef.current = window.setInterval(playNextNote, 300);
    }, [ensureAudio]);

    const jumpSound = useCallback(() => {
        const audio = ensureAudio();
        playTone(audio, 620, 0.16, 0.09);
    }, [ensureAudio]);

    const eatSound = useCallback(() => {
        const audio = ensureAudio();
        playTone(audio, 260, 0.07, 0.05);
        [784, 988, 1318].forEach((frequency, index) => {
            playTone(audio, frequency, 0.18, 0.06, 0.06 + index * 0.08);
        });
    }, [ensureAudio]);

    const startGame = useCallback(() => {
        gameRef.current = {
            ...createGame(),
            status: 'playing',
            velocityY: -9.2,
        };
        setScore(0);
        setStatus('playing');
        jumpSound();
        startMusic();
    }, [jumpSound, startMusic]);

    const handleAction = useCallback(() => {
        const game = gameRef.current;
        if (!canRestart(game)) return;
        if (game.status !== 'playing') {
            startGame();
            return;
        }
        game.velocityY = -9.2;
        jumpSound();
    }, [jumpSound, startGame]);

    const toggleMusic = useCallback(() => {
        const enabled = !musicEnabledRef.current;
        musicEnabledRef.current = enabled;
        setMusicEnabled(enabled);
        if (enabled && gameRef.current.status === 'playing') {
            startMusic();
        } else if (!enabled) {
            stopMusic();
        }
    }, [startMusic, stopMusic]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        let frame = 0;
        let previousTime = 0;
        let displayedScore = -1;
        let displayedStatus: GameStatus | undefined;
        let displayedRestartReady = true;

        const animate = (time: number) => {
            const game = gameRef.current;
            const delta =
                previousTime === 0
                    ? 1
                    : Math.min(2, (time - previousTime) / 16.67);
            previousTime = time;
            const events = advanceGame(game, delta);
            if (events.ateStarfish) eatSound();
            const ready = canRestart(game);
            if (ready !== displayedRestartReady) {
                displayedRestartReady = ready;
                setRestartReady(ready);
            }

            if (displayedScore !== game.score) {
                displayedScore = game.score;
                setScore(game.score);
                if (game.score > highScoreRef.current) {
                    highScoreRef.current = game.score;
                    setHighScore(game.score);
                }
            }
            if (displayedStatus !== game.status) {
                displayedStatus = game.status;
                setStatus(game.status);
                if (game.status === 'over') stopMusic();
            }

            drawGame(context, game, highScoreRef.current);
            frame = window.requestAnimationFrame(animate);
        };

        frame = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(frame);
    }, [eatSound, stopMusic]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code !== 'Space' && event.code !== 'ArrowUp') return;
            if (event.repeat) {
                event.preventDefault();
                return;
            }
            const target = event.target;
            if (
                target instanceof HTMLElement &&
                (target.isContentEditable ||
                    ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(
                        target.tagName
                    ))
            ) {
                return;
            }
            event.preventDefault();
            handleAction();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleAction]);

    useEffect(
        () => () => {
            stopMusic();
            if (audioContextRef.current) {
                void audioContextRef.current.close();
            }
        },
        [stopMusic]
    );

    return (
        <AdminPageLayout
            title="Delfoter Adventure"
            innerClass="flex-1 overflow-y-auto p-6 md:p-8"
        >
            <Link
                className="text-sm text-cyan-800"
                to={APP_ROUTES.delfoter_arcade}
            >
                ← Back to Delfoter Arcade
            </Link>
            <section className="mx-auto w-full max-w-5xl rounded-xl border border-cyan-200 bg-sky-50 p-4 shadow-lg md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-800">
                            Ocean hop · Score {score} · Best {highScore}
                        </p>
                        <p className="mb-0 mt-1 text-sm text-slate-600">
                            Dodge coral, hanging rocks, and sea creatures. Eat
                            glowing starfish for +5 points!
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="rounded-md border border-cyan-800 bg-cyan-700 px-4 py-2 font-semibold text-white hover:bg-cyan-800"
                            onClick={handleAction}
                            disabled={status === 'over' && !restartReady}
                        >
                            {status === 'playing'
                                ? 'Jump!'
                                : status === 'over'
                                  ? restartReady
                                      ? 'Play again'
                                      : 'Take a breath…'
                                  : 'Start swimming'}
                        </button>
                        <button
                            type="button"
                            className="rounded-md border border-slate-400 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                            aria-pressed={musicEnabled}
                            onClick={toggleMusic}
                        >
                            Music: {musicEnabled ? 'On' : 'Off'}
                        </button>
                    </div>
                </div>

                <canvas
                    ref={canvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    aria-label="Delfoter Adventure. Avoid coral, ceiling rocks, and sea creatures. Eat glowing starfish for five bonus points."
                    className="block w-full rounded-lg border-4 border-cyan-700 bg-cyan-200 shadow-inner"
                    style={{ imageRendering: 'pixelated', touchAction: 'none' }}
                    onPointerDown={handleAction}
                />
                {scoreStorageError && (
                    <p className="mt-2 text-sm text-amber-800" role="status">
                        Your best score is shown for this visit, but could not
                        be saved.
                    </p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <p className="m-0">
                        Controls: <strong>Space</strong>, <strong>↑</strong>, or
                        tap the water.
                    </p>
                    <p className="m-0">
                        A tiny otter, a dolphin tail, and a big ocean adventure.
                    </p>
                </div>
            </section>
        </AdminPageLayout>
    );
}
