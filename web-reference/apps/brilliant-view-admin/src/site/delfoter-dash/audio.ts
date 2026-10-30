import { ArcadeMusic } from '../arcade-lobby/ArcadeMusic';
import type { DashCue, DashLevel } from './types';

export class DashAudio {
    private music?: ArcadeMusic;
    private context?: AudioContext;
    private enabled = true;
    private lastCue = -1;
    begin(level: DashLevel, muted: boolean) {
        this.music?.dispose();
        this.music = new ArcadeMusic(
            () => {},
            () => {},
            level.music
        );
        this.resume(muted);
    }
    resume(muted: boolean) {
        this.enabled = !muted;
        if (!muted) {
            try {
                this.context ??= new AudioContext();
                void this.context.resume().catch(() => {});
            } catch {
                /* Music can still play without sound effects. */
            }
        }
        void this.music?.setEnabled(!muted);
    }
    pause() {
        void this.music?.setEnabled(false);
    }
    setMuted(muted: boolean, playing: boolean) {
        this.enabled = !muted;
        if (playing) this.resume(muted);
        else this.pause();
    }
    play(cues: DashCue[]) {
        const ctx = this.context;
        if (!this.enabled || !ctx || ctx.state !== 'running' || !cues.length)
            return;
        const cue = [
            'phase',
            'crash',
            'finish',
            'orb',
            'pad',
            'shell',
            'jump',
            'land',
        ].find((c) => cues.includes(c as DashCue)) as DashCue;
        if (
            ctx.currentTime - this.lastCue < 0.035 &&
            cue !== 'crash' &&
            cue !== 'finish'
        )
            return;
        this.lastCue = ctx.currentTime;
        const pitches: Record<DashCue, number> = {
            phase: 1760,
            jump: 440,
            land: 120,
            shell: 1320,
            pad: 660,
            orb: 880,
            crash: 90,
            finish: 1047,
        };
        for (let i = 0; i < (cue === 'finish' ? 4 : 1); i++) {
            const oscillator = ctx.createOscillator(),
                gain = ctx.createGain(),
                at = ctx.currentTime + i * 0.09;
            const duration = cue === 'crash' ? 0.32 : 0.14;
            oscillator.type = cue === 'crash' ? 'sawtooth' : 'triangle';
            oscillator.frequency.setValueAtTime(
                pitches[cue] * [1, 1.25, 1.5, 2][i],
                at
            );
            oscillator.frequency.exponentialRampToValueAtTime(
                pitches[cue] * (cue === 'jump' || cue === 'pad' ? 2 : 0.5),
                at + duration
            );
            gain.gain.setValueAtTime(0.0001, at);
            gain.gain.exponentialRampToValueAtTime(
                cue === 'land' ? 0.025 : 0.06,
                at + 0.006
            );
            gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.start(at);
            oscillator.stop(at + duration + 0.01);
            oscillator.onended = () => {
                oscillator.disconnect();
                gain.disconnect();
            };
        }
    }
    dispose() {
        this.music?.dispose();
        if (this.context) void this.context.close().catch(() => {});
    }
}
