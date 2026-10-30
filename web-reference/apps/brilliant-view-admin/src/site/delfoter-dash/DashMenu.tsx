import { progress } from './engine';
import { DASH_LEVELS } from './levels';
import type { DashLevel, DashRecord, DashState } from './types';
import { DASH_WORLDS, worldFor, worldUnlocked } from './worlds';

export function DashMenu({
    game,
    records,
    attempt,
    onChoose,
    onBegin,
    onResume,
}: {
    game: DashState;
    records: Record<string, DashRecord>;
    attempt: number;
    onChoose: (level: DashLevel) => void;
    onBegin: (level: DashLevel) => void;
    onResume: () => void;
}) {
    const world = worldFor(game.level),
        worldIndex = DASH_WORLDS.indexOf(world);
    const levels = DASH_LEVELS.filter((level) => level.worldId === world.id);
    const previousWorld = DASH_WORLDS[worldIndex - 1];
    const previousLevels = DASH_LEVELS.filter(
        (level) => level.worldId === previousWorld?.id
    );
    const unlocked = worldUnlocked(world.id, DASH_LEVELS, records);
    const completed = levels.filter(
        (level) => records[level.id]?.completed
    ).length;
    const worldFinished =
        game.phase === 'complete' &&
        levels.every((level) => records[level.id]?.completed);
    const next = worldFinished
        ? DASH_LEVELS.find(
              (level) => level.worldId === DASH_WORLDS[worldIndex + 1]?.id
          )
        : DASH_LEVELS[
              DASH_LEVELS.findIndex((level) => level.id === game.level.id) + 1
          ];
    if (game.phase === 'playing') return null;
    if (game.phase === 'ready')
        return (
            <div className="dash-ready-grid">
                <div className="dash-intro">
                    <p className="dash-eyebrow">
                        WORLD {worldIndex + 1} · {world.name.toUpperCase()}
                    </p>
                    <h1>
                        {world.theme === 'neon' ? (
                            <>
                                Find your
                                <br />
                                <em>flow.</em>
                            </>
                        ) : (
                            <>
                                Break
                                <br />
                                <em>the ice.</em>
                            </>
                        )}
                    </h1>
                    <p>{world.subtitle}</p>
                    <div className="dash-control-guide">
                        <span>
                            <kbd>SPACE</kbd> / tap to jump
                        </span>
                        <span>Hold to chain jumps</span>
                        {(worldIndex > 0 || game.level.number >= 3) && (
                            <span>
                                {game.level.hazards.some(
                                    (h) => h.sequence === 2
                                )
                                    ? 'Tap ring 1, then ring 2 before landing'
                                    : 'Wide gap? Jump, then tap its air ring'}
                            </span>
                        )}
                        {game.level.number >= 4 && worldIndex === 0 && (
                            <span>
                                Land on each pillar and jump from its ledge
                            </span>
                        )}
                        {world.ability === 'phase' && (
                            <span>
                                <kbd>SHIFT / X</kbd> or Phase → pass laser gates
                            </span>
                        )}
                    </div>
                </div>
                <section
                    className="dash-course-panel"
                    aria-label="Choose a course"
                >
                    <div
                        className="dash-world-tabs"
                        role="group"
                        aria-label="Choose a world"
                    >
                        {DASH_WORLDS.map((item, index) => {
                            const count = DASH_LEVELS.filter(
                                (level) =>
                                    level.worldId === item.id &&
                                    records[level.id]?.completed
                            ).length;
                            const open = worldUnlocked(
                                item.id,
                                DASH_LEVELS,
                                records
                            );
                            return (
                                <button
                                    key={item.id}
                                    aria-pressed={world.id === item.id}
                                    onClick={() =>
                                        onChoose(
                                            DASH_LEVELS.find(
                                                (level) =>
                                                    level.worldId === item.id
                                            )!
                                        )
                                    }
                                >
                                    <strong>
                                        0{index + 1} · {item.name}
                                    </strong>
                                    <small>
                                        {open
                                            ? `${count}/${DASH_LEVELS.filter((level) => level.worldId === item.id).length} complete`
                                            : `Locked · clear ${DASH_WORLDS[index - 1]?.name}`}
                                    </small>
                                </button>
                            );
                        })}
                    </div>
                    <p className="dash-eyebrow">
                        {unlocked ? 'PICK YOUR LINE' : 'NEXT WORLD · LOCKED'}
                    </p>
                    <h2>
                        {world.name}
                        <small>
                            {completed}/{levels.length}
                        </small>
                    </h2>
                    {!unlocked && (
                        <p className="dash-world-lock">
                            Complete all {previousLevels.length}{' '}
                            {previousWorld?.name} levels to unlock this world.{' '}
                            {
                                previousLevels.filter(
                                    (level) => records[level.id]?.completed
                                ).length
                            }
                            /{previousLevels.length} complete.
                        </p>
                    )}
                    <div className="dash-course-list">
                        {levels.map((level) => (
                            <button
                                key={level.id}
                                disabled={!unlocked}
                                aria-pressed={game.level.id === level.id}
                                onClick={() => onChoose(level)}
                            >
                                <span className="dash-course-number">
                                    0{level.number}
                                </span>
                                <span>
                                    <strong>{level.name}</strong>
                                    <small>
                                        {level.difficulty} · {level.bpm} BPM ·{' '}
                                        {Math.round(level.length / level.speed)}{' '}
                                        sec
                                    </small>
                                </span>
                                <b>
                                    {records[level.id]?.completed
                                        ? '✓'
                                        : `${records[level.id]?.progress ?? 0}%`}
                                </b>
                            </button>
                        ))}
                    </div>
                    <p className="dash-course-subtitle">
                        {game.level.subtitle}
                        <span>
                            Best: {records[game.level.id]?.progress ?? 0}%
                        </span>
                    </p>
                    <button
                        className="dash-primary"
                        disabled={!unlocked}
                        onClick={() => onBegin(game.level)}
                    >
                        {unlocked ? '▶ Drop in' : 'World locked'}
                        <span>0{game.level.number}</span>
                    </button>
                    <small className="dash-start-note">
                        {world.ability === 'phase'
                            ? 'Phase lasts a moment, then recharges. Time it at the gate.'
                            : 'Original soundtrack starts when you drop in.'}
                    </small>
                </section>
            </div>
        );
    return (
        <div className="dash-overlay">
            <section
                className={`dash-result ${game.phase === 'complete' ? 'is-complete' : ''}`}
                aria-labelledby="dash-result-title"
            >
                <p className="dash-eyebrow">
                    {game.phase === 'paused'
                        ? 'TAKE A BREATHER'
                        : worldFinished
                          ? 'WORLD COMPLETE'
                          : game.phase === 'complete'
                            ? 'LINE COMPLETE · REEF RESPECT'
                            : 'WIPEOUT · GO AGAIN'}
                </p>
                <h2 id="dash-result-title">
                    {game.phase === 'paused'
                        ? 'Keep your cool.'
                        : worldFinished
                          ? `${world.name} mastered!`
                          : game.phase === 'complete'
                            ? 'That was a clean ride.'
                            : 'One more wave?'}
                </h2>
                <p>
                    {game.phase === 'paused'
                        ? 'Your board is waiting right here.'
                        : worldFinished
                          ? next
                              ? `${worldFor(next).name} is now unlocked. A new world and a new ability await.`
                              : 'Both worlds complete. Every line, every leap, all yours.'
                          : game.phase === 'complete'
                            ? `${game.shells.size} shells collected. Your best run is saved.`
                            : `Attempt ${attempt}. Every jump gets you a little closer.`}
                </p>
                <div className="dash-result-stats">
                    <span>
                        <b>{progress(game)}%</b>COURSE
                    </span>
                    <span>
                        <b>{game.shells.size}</b>SHELLS
                    </span>
                    <span>
                        <b>{records[game.level.id]?.progress ?? 0}%</b>BEST
                    </span>
                </div>
                <button
                    className="dash-primary"
                    onClick={() => {
                        if (game.phase === 'paused') onResume();
                        else if (game.phase !== 'complete') onBegin(game.level);
                        else if (
                            next &&
                            worldUnlocked(next.worldId, DASH_LEVELS, records)
                        )
                            onBegin(next);
                        else onChoose(game.level);
                    }}
                >
                    {game.phase === 'paused'
                        ? '▶ Back to the flow'
                        : game.phase !== 'complete'
                          ? '↻ Ride again'
                          : next &&
                              worldUnlocked(next.worldId, DASH_LEVELS, records)
                            ? `Next: ${next.name} →`
                            : 'Choose a world'}
                </button>
                <div className="dash-result-secondary">
                    {game.phase === 'complete' && (
                        <button onClick={() => onBegin(game.level)}>
                            Replay course
                        </button>
                    )}
                    <button onClick={() => onChoose(game.level)}>
                        Choose course
                    </button>
                </div>
                <small>
                    Space / tap → jump · R → restart · P → pause
                    {world.ability === 'phase' ? ' · Shift / X → phase' : ''}
                </small>
            </section>
        </div>
    );
}
