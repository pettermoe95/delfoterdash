import { expect, it } from 'vitest';
import {
    advanceGame,
    canRestart,
    createGame,
    PLAYER_X,
    RESTART_DELAY,
} from './game';

it('makes ceiling rocks lethal even when the player swims along the top', () => {
    const game = createGame();
    game.status = 'playing';
    game.playerY = 0;
    game.obstacles = [
        {
            kind: 'ceiling',
            x: PLAYER_X + 60,
            y: 0,
            width: 72,
            height: 160,
            phase: 0,
            scored: false,
        },
    ];
    advanceGame(game, 1);
    expect(game.status).toBe('over');
    expect(canRestart(game)).toBe(false);
    advanceGame(game, RESTART_DELAY * 60 + 1);
    expect(canRestart(game)).toBe(true);
});

it('awards five points once, consumes a starfish, and starts eating and glow effects', () => {
    const game = createGame();
    game.status = 'playing';
    game.playerY = 220;
    game.obstacles = [];
    game.starfish = [{ x: PLAYER_X + 111 + 3.4, y: 243, phase: 0 }];
    expect(advanceGame(game, 1).ateStarfish).toBe(true);
    expect(game.score).toBe(5);
    expect(game.eating?.startedAt).toBe(game.elapsed);
    expect(game.glowUntil).toBe(game.elapsed + 4);
    expect(game.starfish.every((starfish) => starfish.x > 600)).toBe(true);
    expect(advanceGame(game, 1).ateStarfish).toBe(false);
    expect(game.score).toBe(5);
});

it('guarantees recurring ceiling obstacles while leaving gaps for collectibles', () => {
    const game = createGame();
    game.status = 'playing';
    game.playerY = 220;
    game.starfish = [];
    const kinds = [];
    for (let index = 0; index < 4; index += 1) {
        game.obstacles = [];
        advanceGame(game, 1);
        const spawned = game.obstacles.at(-1);
        kinds.push(spawned?.kind);
        const starfish = game.starfish.at(-1);
        expect(starfish?.x).toBe((spawned?.x ?? 0) - 170);
    }
    expect(kinds[0]).toBe('ceiling');
    expect(kinds[3]).toBe('ceiling');
});

it('does not collect a starfish on the same frame as a fatal collision', () => {
    const game = createGame();
    game.status = 'playing';
    game.starfish = [{ x: PLAYER_X + 111, y: game.playerY + 23, phase: 0 }];
    expect(advanceGame(game, 1).ateStarfish).toBe(false);
    expect(game.score).toBe(0);
    expect(game.status).toBe('over');
});
