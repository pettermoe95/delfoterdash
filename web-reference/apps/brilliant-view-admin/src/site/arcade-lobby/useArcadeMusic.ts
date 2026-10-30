import { useEffect, useRef, useState } from 'react';
import { ArcadeMusic } from './ArcadeMusic';

const STORAGE_KEY = 'delfoter-arcade-music-muted';

export function useArcadeMusic() {
    const [muted, setMuted] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });
    const [playing, setPlaying] = useState(false);
    const [failure, setFailure] = useState<'blocked' | 'failed' | null>(null);
    const entered = useRef(false);
    const music = useRef<ArcadeMusic | null>(null);
    const preference = useRef(muted);
    preference.current = muted;
    useEffect(() => {
        const soundtrack = new ArcadeMusic(
            (active) => {
                setPlaying(active);
                if (active) setFailure(null);
            },
            (blocked) => setFailure(blocked ? 'blocked' : 'failed')
        );
        music.current = soundtrack;
        const start = (event?: Event) => {
            // Let the music button handle its own gesture so starting playback
            // cannot turn the same click into a mute action.
            if (
                event?.target instanceof Element &&
                event.target.closest('.arcade-music-control')
            )
                return;
            if (entered.current && !preference.current && !document.hidden)
                void soundtrack.setEnabled(true);
        };
        const visibility = () =>
            void soundtrack.setEnabled(
                entered.current && !preference.current && !document.hidden
            );
        window.addEventListener('pointerdown', start);
        window.addEventListener('keydown', start);
        document.addEventListener('visibilitychange', visibility);
        return () => {
            window.removeEventListener('pointerdown', start);
            window.removeEventListener('keydown', start);
            document.removeEventListener('visibilitychange', visibility);
            soundtrack.dispose();
            music.current = null;
        };
    }, []);

    function setMusicMuted(next: boolean) {
        setFailure(null);
        preference.current = next;
        setMuted(next);
        try {
            localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
            /* Storage may be disabled. */
        }
        void music.current?.setEnabled(!next && !document.hidden);
    }

    function enter() {
        entered.current = true;
        // Call play directly in the Enter button's click handler, before rendering games.
        void music.current?.setEnabled(!preference.current && !document.hidden);
    }

    return {
        muted,
        playing,
        failure,
        enter,
        toggle: () => setMusicMuted(!muted && playing),
    };
}
