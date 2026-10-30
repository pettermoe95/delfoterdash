import { useCallback, useEffect, useRef, useState } from 'react';
import { DashAudio } from './audio';
import { advanceDash, createDash, requestJump, requestPhase } from './engine';
import { DASH_LEVELS } from './levels';
import { loadRecords, saveRecord } from './records';
import type { DashLevel } from './types';
import { worldUnlocked } from './worlds';

const MUTE_KEY = 'delfoter-arcade-music-muted';
export function useDash() {
    const game = useRef(createDash(DASH_LEVELS[0]));
    const audio = useRef<DashAudio>();
    const held = useRef(false);
    const [revision, render] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const [records, setRecords] = useState(loadRecords);
    const recordRef = useRef(records);
    recordRef.current = records;
    const [muted, setMuted] = useState(() => {
        try {
            return localStorage.getItem(MUTE_KEY) === 'true';
        } catch {
            return false;
        }
    });
    const muteRef = useRef(muted);
    muteRef.current = muted;
    const refresh = () => render((n) => n + 1);
    useEffect(() => {
        const player = new DashAudio();
        audio.current = player;
        let frame = 0,
            previous = 0,
            sinceRender = 0;
        const animate = (now: number) => {
            const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
            previous = now;
            const before = game.current.phase;
            if (!document.hidden)
                player.play(advanceDash(game.current, dt, held.current));
            if (
                before !== game.current.phase &&
                (game.current.phase === 'dead' ||
                    game.current.phase === 'complete')
            ) {
                held.current = false;
                player.pause();
                const next = saveRecord(recordRef.current, game.current);
                recordRef.current = next;
                setRecords(next);
            }
            sinceRender += dt;
            if (sinceRender >= 1 / 30 || before !== game.current.phase) {
                refresh();
                sinceRender = 0;
            }
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        const leave = () => {
            held.current = false;
            if (game.current.phase === 'playing') {
                game.current.phase = 'paused';
                player.pause();
                refresh();
            }
        };
        const visibility = () => {
            if (document.hidden) leave();
        };
        window.addEventListener('blur', leave);
        document.addEventListener('visibilitychange', visibility);
        return () => {
            cancelAnimationFrame(frame);
            player.dispose();
            audio.current = undefined;
            window.removeEventListener('blur', leave);
            document.removeEventListener('visibilitychange', visibility);
        };
    }, []);
    const begin = useCallback((level: DashLevel) => {
        if (!worldUnlocked(level.worldId, DASH_LEVELS, recordRef.current))
            return;
        const same = game.current.level.id === level.id;
        held.current = false;
        game.current = createDash(level);
        game.current.phase = 'playing';
        setAttempt((n) => (same ? n + 1 : 1));
        audio.current?.begin(level, muteRef.current);
        refresh();
    }, []);
    const jump = useCallback(() => {
        if (game.current.phase === 'playing') {
            held.current = true;
            audio.current?.play(requestJump(game.current));
        } else if (
            game.current.phase === 'dead' &&
            game.current.deathAge > 0.35
        )
            begin(game.current.level);
    }, [begin]);
    const phase = useCallback(() => {
        audio.current?.play(requestPhase(game.current));
        refresh();
    }, []);
    const release = useCallback(() => {
        held.current = false;
    }, []);
    const pause = useCallback(() => {
        held.current = false;
        if (game.current.phase === 'playing') {
            game.current.phase = 'paused';
            audio.current?.pause();
        } else if (game.current.phase === 'paused') {
            game.current.phase = 'playing';
            audio.current?.resume(muteRef.current);
        }
        refresh();
    }, []);
    const choose = useCallback((level: DashLevel) => {
        held.current = false;
        audio.current?.pause();
        game.current = createDash(level);
        setAttempt(0);
        refresh();
    }, []);
    function toggleMute() {
        const next = !muted;
        muteRef.current = next;
        setMuted(next);
        try {
            localStorage.setItem(MUTE_KEY, String(next));
        } catch {
            /* Optional persistence. */
        }
        audio.current?.setMuted(next, game.current.phase === 'playing');
    }
    return {
        game: game.current,
        gameRef: game,
        revision,
        attempt,
        records,
        muted,
        begin,
        jump,
        phase,
        release,
        pause,
        choose,
        toggleMute,
    };
}
