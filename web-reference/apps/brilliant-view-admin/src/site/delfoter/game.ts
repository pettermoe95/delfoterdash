export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 480;
export const GROUND_Y = 414;
export const PLAYER_X = 170;
export const PLAYER_WIDTH = 114;
export const PLAYER_HEIGHT = 42;
export const RESTART_DELAY = 1.25;

export type Obstacle = {
    kind: 'coral' | 'ceiling' | 'jellyfish' | 'pufferfish';
    x: number;
    y: number;
    width: number;
    height: number;
    phase: number;
    scored: boolean;
};
export type Starfish = { x: number; y: number; phase: number };
export type GameStatus = 'ready' | 'playing' | 'over';
export type GameState = {
    status: GameStatus;
    playerY: number;
    velocityY: number;
    obstacles: Obstacle[];
    obstaclesSpawned: number;
    starfish: Starfish[];
    eating: { startedAt: number; offsetX: number; offsetY: number } | null;
    glowUntil: number;
    restartAt: number;
    score: number;
    elapsed: number;
};

export const createGame = (): GameState => ({
    status: 'ready',
    playerY: GROUND_Y - PLAYER_HEIGHT,
    velocityY: 0,
    obstacles: [
        {
            kind: 'coral',
            x: 620,
            y: GROUND_Y - 62,
            width: 44,
            height: 62,
            phase: 0,
            scored: false,
        },
    ],
    obstaclesSpawned: 1,
    starfish: [{ x: 455, y: 280, phase: 0 }],
    eating: null,
    glowUntil: 0,
    restartAt: 0,
    score: 0,
    elapsed: 0,
});

export function obstacleY(obstacle: Obstacle, elapsed: number): number {
    return obstacle.kind === 'coral' || obstacle.kind === 'ceiling'
        ? obstacle.y
        : obstacle.y + Math.round(Math.sin(elapsed * 2 + obstacle.phase) * 8);
}

export function starfishY(starfish: Starfish, elapsed: number): number {
    return starfish.y + Math.sin(elapsed * 3 + starfish.phase) * 6;
}

function createObstacle(sequence: number): Obstacle {
    // A ceiling hazard is guaranteed every third obstacle.
    const kind: Obstacle['kind'] =
        sequence % 3 === 1
            ? 'ceiling'
            : sequence % 3 === 0
              ? 'coral'
              : Math.random() < 0.5
                ? 'jellyfish'
                : 'pufferfish';
    const height =
        kind === 'ceiling'
            ? 130 + Math.round(Math.random() * 60)
            : kind === 'coral'
              ? 48 + Math.round(Math.random() * 40)
              : kind === 'jellyfish'
                ? 48
                : 36;
    return {
        kind,
        x: GAME_WIDTH + 20,
        y:
            kind === 'ceiling'
                ? 0
                : kind === 'coral'
                  ? GROUND_Y - height
                  : 190 + Math.round(Math.random() * 125),
        width: kind === 'ceiling' ? 72 : kind === 'pufferfish' ? 48 : 44,
        height,
        phase: Math.random() * Math.PI * 2,
        scored: false,
    };
}

export function canRestart(game: GameState): boolean {
    return game.status !== 'over' || game.elapsed >= game.restartAt;
}

export function advanceGame(
    game: GameState,
    delta: number
): { ateStarfish: boolean } {
    game.elapsed += delta / 60;
    if (game.status !== 'playing') return { ateStarfish: false };

    game.velocityY += 0.42 * delta;
    game.playerY += game.velocityY * delta;
    if (game.playerY < 0) {
        game.playerY = 0;
        game.velocityY = 0;
    }

    const speed = 3.4 * delta;
    const playerLeft = PLAYER_X + 36;
    const playerRight = PLAYER_X + PLAYER_WIDTH - 5;
    const playerTop = game.playerY + 6;
    const playerBottom = game.playerY + PLAYER_HEIGHT - 4;
    let crashed = game.playerY + PLAYER_HEIGHT >= GROUND_Y;
    game.obstacles.forEach((obstacle) => {
        obstacle.x -= speed;
        const top = obstacleY(obstacle, game.elapsed);
        if (
            playerRight > obstacle.x + 4 &&
            playerLeft < obstacle.x + obstacle.width - 4 &&
            playerBottom > top + 2 &&
            playerTop < top + obstacle.height - 2
        ) {
            crashed = true;
        }
    });
    if (crashed) {
        game.playerY = Math.min(game.playerY, GROUND_Y - PLAYER_HEIGHT);
        game.status = 'over';
        game.restartAt = game.elapsed + RESTART_DELAY;
        return { ateStarfish: false };
    }

    game.obstacles.forEach((obstacle) => {
        if (!obstacle.scored && obstacle.x + obstacle.width < PLAYER_X) {
            obstacle.scored = true;
            game.score += 1;
        }
    });
    game.obstacles = game.obstacles.filter(
        (obstacle) => obstacle.x + obstacle.width >= -10
    );

    let ateStarfish = false;
    const mouthX = PLAYER_X + 111;
    const mouthY = game.playerY + 23;
    game.starfish = game.starfish.filter((starfish) => {
        starfish.x -= speed;
        const y = starfishY(starfish, game.elapsed);
        if (Math.abs(starfish.x - mouthX) < 24 && Math.abs(y - mouthY) < 24) {
            game.score += 5;
            game.glowUntil = game.elapsed + 4;
            game.eating = {
                startedAt: game.elapsed,
                offsetX: starfish.x - mouthX,
                offsetY: y - mouthY,
            };
            ateStarfish = true;
            return false;
        }
        return starfish.x > -24;
    });

    const lastObstacleX = game.obstacles.at(-1)?.x ?? -Infinity;
    if (lastObstacleX < GAME_WIDTH - 340) {
        const obstacle = createObstacle(game.obstaclesSpawned);
        game.obstaclesSpawned += 1;
        game.obstacles.push(obstacle);
        // Place collectibles in the open water between hazards.
        game.starfish.push({
            x: obstacle.x - 170,
            y: 150 + Math.random() * 140,
            phase: Math.random() * Math.PI * 2,
        });
    }
    return { ateStarfish };
}
