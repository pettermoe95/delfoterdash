// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { MusicToggle } from './MusicToggle';
import { useArcadeMusic } from './useArcadeMusic';

const audio = vi.hoisted(() => ({ setEnabled: vi.fn(), dispose: vi.fn() }));
vi.mock('./ArcadeMusic', () => ({
    ArcadeMusic: class {
        constructor(private onPlaying: (playing: boolean) => void) {}
        setEnabled(enabled: boolean) {
            audio.setEnabled(enabled);
            this.onPlaying(enabled);
        }
        dispose = audio.dispose;
    },
}));

function Probe() {
    const music = useArcadeMusic();
    const [entered, setEntered] = useState(false);
    return entered ? (
        <MusicToggle music={music} />
    ) : (
        <button
            onClick={() => {
                music.enter();
                setEntered(true);
            }}
        >
            Enter Arcade
        </button>
    );
}

it('waits for Enter Arcade to start music, restores the entry screen on remount, and preserves mute', () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    localStorage.setItem('delfoter-arcade-music-muted', 'false');
    audio.setEnabled.mockClear();
    audio.dispose.mockClear();
    const container = document.createElement('div');
    document.body.append(container);
    let root = createRoot(container);
    try {
        act(() => root.render(<Probe />));
        expect(audio.setEnabled).not.toHaveBeenCalled();
        const enter = container.querySelector('button')!;
        act(() =>
            enter.dispatchEvent(new Event('pointerdown', { bubbles: true }))
        );
        expect(audio.setEnabled).not.toHaveBeenCalled();
        act(() => enter.click());
        expect(audio.setEnabled).toHaveBeenCalledOnce();
        expect(audio.setEnabled).toHaveBeenLastCalledWith(true);
        const button = container.querySelector('button')!;
        expect(button.getAttribute('aria-label')).toBe('Mute arcade music');
        act(() => button.click());
        expect(audio.setEnabled).toHaveBeenLastCalledWith(false);
        expect(localStorage.getItem('delfoter-arcade-music-muted')).toBe(
            'true'
        );
        act(() => root.unmount());
        expect(audio.dispose).toHaveBeenCalledOnce();
        root = createRoot(container);
        const previousCalls = audio.setEnabled.mock.calls.length;
        act(() => root.render(<Probe />));
        expect(container.textContent).toBe('Enter Arcade');
        expect(audio.setEnabled).toHaveBeenCalledTimes(previousCalls);
        act(() => container.querySelector('button')!.click());
        expect(audio.setEnabled).toHaveBeenLastCalledWith(false);
        expect(
            container.querySelector('button')?.getAttribute('aria-label')
        ).toBe('Unmute arcade music');
        act(() => container.querySelector('button')!.click());
        expect(audio.setEnabled).toHaveBeenLastCalledWith(true);
    } finally {
        act(() => root.unmount());
        container.remove();
        localStorage.removeItem('delfoter-arcade-music-muted');
    }
});
