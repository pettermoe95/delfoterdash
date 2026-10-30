import { afterEach, expect, it, vi } from 'vitest';
import { ArcadeMusic } from './ArcadeMusic';

class FakeAudio extends EventTarget {
    loop = false;
    autoplay = false;
    preload = '';
    volume = 1;
    play = vi.fn(() => Promise.resolve());
    pause = vi.fn();
    removeAttribute = vi.fn();
    load = vi.fn();
}
afterEach(() => {
    vi.unstubAllGlobals();
});

it('requests native autoplay on startup and refresh, respects mute, and releases playback on unmount', async () => {
    const tracks: FakeAudio[] = [];
    vi.stubGlobal(
        'Audio',
        class extends FakeAudio {
            constructor() {
                super();
                tracks.push(this);
            }
        }
    );
    const playing = vi.fn();
    const first = new ArcadeMusic(playing);
    await first.setEnabled(true);
    expect(tracks[0].autoplay).toBe(true);
    expect(tracks[0].loop).toBe(true);
    expect(tracks[0].play).toHaveBeenCalledOnce();
    expect(playing).toHaveBeenLastCalledWith(true);
    await first.setEnabled(false);
    expect(tracks[0].autoplay).toBe(false);
    expect(tracks[0].pause).toHaveBeenCalled();
    first.dispose();
    const refreshed = new ArcadeMusic(playing);
    await refreshed.setEnabled(true);
    expect(tracks[1].play).toHaveBeenCalledOnce();
    refreshed.dispose();
    expect(
        tracks.every((track) =>
            track.removeAttribute.mock.calls.some(([name]) => name === 'src')
        )
    ).toBe(true);
    expect(tracks.every((track) => track.load.mock.calls.length === 1)).toBe(
        true
    );
});

it('reports an actual autoplay rejection and ignores pending playback cancelled by cleanup', async () => {
    const track = new FakeAudio();
    track.play.mockRejectedValueOnce(
        new DOMException('Gesture required', 'NotAllowedError')
    );
    vi.stubGlobal(
        'Audio',
        class {
            constructor() {
                return track;
            }
        }
    );
    const failure = vi.fn(),
        playing = vi.fn();
    const music = new ArcadeMusic(playing, failure);
    await music.setEnabled(true);
    expect(failure).toHaveBeenLastCalledWith(true);
    await music.setEnabled(true);
    expect(playing).toHaveBeenLastCalledWith(true);
    let rejectPlay!: (reason: unknown) => void;
    track.play.mockImplementationOnce(
        () =>
            new Promise((_, reject) => {
                rejectPlay = reject;
            })
    );
    const pending = music.setEnabled(true);
    failure.mockClear();
    playing.mockClear();
    music.dispose();
    rejectPlay(new DOMException('Unmounted', 'AbortError'));
    await pending;
    expect(failure).not.toHaveBeenCalled();
    expect(playing).not.toHaveBeenCalled();
});
