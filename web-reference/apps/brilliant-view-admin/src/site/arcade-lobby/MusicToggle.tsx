import type { useArcadeMusic } from './useArcadeMusic';

export function MusicToggle({
    music,
}: {
    music: ReturnType<typeof useArcadeMusic>;
}) {
    const { muted, playing, failure } = music;

    return (
        <div className="arcade-music-control">
            <button
                type="button"
                onClick={music.toggle}
                aria-pressed={muted}
                aria-label={
                    muted
                        ? 'Unmute arcade music'
                        : playing
                          ? 'Mute arcade music'
                          : 'Play arcade music'
                }
            >
                <span aria-hidden="true">{muted ? '♫ ×' : '♫'}</span>
                {muted
                    ? 'Music muted'
                    : playing
                      ? 'Music on'
                      : failure
                        ? 'Play music'
                        : 'Starting music…'}
                <span
                    className={`arcade-equalizer ${playing ? 'is-playing' : ''}`}
                    aria-hidden="true"
                >
                    <i />
                    <i />
                    <i />
                    <i />
                </span>
            </button>
            {!muted && !playing && failure && (
                <small>
                    {failure === 'blocked'
                        ? 'Browser requires a click to play'
                        : 'Music could not start · click to retry'}
                </small>
            )}
        </div>
    );
}
