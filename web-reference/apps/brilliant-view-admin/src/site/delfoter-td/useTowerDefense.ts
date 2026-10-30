import { useEffect, useRef, useState } from 'react';
import { DelfoterAudio } from './audio';
import { createGame, step } from './engine';
import { MAPS } from './maps';

export function useTowerDefense(suspended = false) {
    const game = useRef(createGame(MAPS[0]));
    const audio = useRef<DelfoterAudio>();
    const [revision, render] = useState(0);
    const [paused, setPaused] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [sound, setSound] = useState(true);
    const refresh = () => render((value) => value + 1);
    useEffect(() => {
        const player = new DelfoterAudio();
        audio.current = player;
        let mounted = true;
        const unlockOnInteraction = () => {
            if (!player.enabled) return;
            void player.unlock().then(() => {
                if (mounted) setSound(player.enabled);
            });
        };
        window.addEventListener('pointerdown', unlockOnInteraction, {
            capture: true,
            once: true,
        });
        window.addEventListener('keydown', unlockOnInteraction, {
            capture: true,
            once: true,
        });
        return () => {
            mounted = false;
            window.removeEventListener(
                'pointerdown',
                unlockOnInteraction,
                true
            );
            window.removeEventListener('keydown', unlockOnInteraction, true);
            player.dispose();
            audio.current = undefined;
        };
    }, []);
    useEffect(() => {
        let frame = 0;
        let previous = 0;
        let sinceRender = 0;
        const animate = (now: number) => {
            const elapsed = previous
                ? Math.min((now - previous) / 1000, 0.05)
                : 0;
            previous = now;
            if (
                !paused &&
                !suspended &&
                !document.hidden &&
                game.current.phase === 'wave'
            ) {
                // Small substeps preserve fire rates and collision checks at every speed.
                for (let i = 0; i < speed; i++) {
                    const sounds = step(game.current, elapsed);
                    const cue = sounds.includes('win')
                        ? 'win'
                        : sounds.includes('leak')
                          ? 'leak'
                          : sounds.includes('freeze')
                            ? 'freeze'
                            : sounds.includes('pop')
                              ? 'pop'
                              : sounds[0];
                    if (cue) audio.current?.play(cue);
                }
                sinceRender += elapsed;
                if (sinceRender >= 1 / 30 || game.current.phase !== 'wave') {
                    refresh();
                    sinceRender = 0;
                }
            }
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [paused, speed, suspended]);
    async function toggleSound() {
        const player = audio.current;
        if (!player) return;
        player.enabled = !player.enabled;
        if (player.enabled) await player.unlock();
        setSound(player.enabled);
        player.play('wave');
    }
    return {
        game: game.current,
        gameRef: game,
        revision,
        refresh,
        paused,
        setPaused,
        speed,
        setSpeed,
        sound,
        toggleSound,
    };
}
