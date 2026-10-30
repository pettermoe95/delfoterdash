import type { Sound } from './types';

// Original synthesized chirps, squeaks, water bursts and robot crackles. No downloads or autoplay.
export class DelfoterAudio {
    private context?: AudioContext;
    private lastPlayed = 0;
    enabled = true;

    async unlock() {
        try {
            this.context ??= new AudioContext();
            await this.context.resume();
        } catch {
            this.enabled = false;
        }
    }

    play(sound: Sound) {
        const ctx = this.context;
        if (
            !this.enabled ||
            !ctx ||
            ctx.state !== 'running' ||
            ctx.currentTime - this.lastPlayed < 0.055
        )
            return;
        this.lastPlayed = ctx.currentTime;
        if (sound === 'freeze') {
            this.freeze(ctx);
            return;
        }
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const pitch = {
            repeater: 1200,
            rocket: 100,
            spritz: 950,
            soaker: 320,
            sniper: 1500,
            pop: 1400,
            wave: 660,
            leak: 110,
            win: 880,
        }[sound];
        const duration = sound === 'repeater' ? 0.065 : 0.2;
        oscillator.type = sound === 'leak' ? 'sawtooth' : 'sine';
        oscillator.frequency.setValueAtTime(pitch, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            pitch * (sound === 'pop' || sound === 'win' ? 1.8 : 0.35),
            ctx.currentTime + duration * 0.8
        );
        // A second pitch bend gives the defenders a little dolphin-like squeak.
        if (sound === 'wave' || sound === 'win' || sound === 'spritz') {
            oscillator.frequency.exponentialRampToValueAtTime(
                pitch * 1.3,
                ctx.currentTime + 0.07
            );
            oscillator.frequency.exponentialRampToValueAtTime(
                pitch * 0.65,
                ctx.currentTime + 0.19
            );
        }
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            sound === 'repeater' ? 0.035 : 0.075,
            ctx.currentTime + 0.008
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + duration
        );
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration + 0.02);
        oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
        };
        if (
            sound === 'spritz' ||
            sound === 'soaker' ||
            sound === 'sniper' ||
            sound === 'rocket' ||
            sound === 'pop'
        ) {
            const buffer = ctx.createBuffer(
                1,
                Math.ceil(ctx.sampleRate * 0.18),
                ctx.sampleRate
            );
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++)
                data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            const filter = ctx.createBiquadFilter();
            const spray = ctx.createGain();
            noise.buffer = buffer;
            filter.type = 'bandpass';
            filter.frequency.value = sound === 'soaker' ? 800 : 2600;
            spray.gain.setValueAtTime(0.055, ctx.currentTime);
            spray.gain.exponentialRampToValueAtTime(
                0.0001,
                ctx.currentTime + 0.18
            );
            noise.connect(filter);
            filter.connect(spray);
            spray.connect(ctx.destination);
            noise.start();
            noise.onended = () => {
                noise.disconnect();
                filter.disconnect();
                spray.disconnect();
            };
        }
    }

    private freeze(ctx: AudioContext) {
        const at = ctx.currentTime;
        // Soft crystalline chimes over a short, filtered snow crunch.
        for (const [index, pitch] of [1760, 2349, 3136].entries()) {
            const chime = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = at + index * 0.025;
            chime.type = 'sine';
            chime.frequency.setValueAtTime(pitch, start);
            chime.frequency.exponentialRampToValueAtTime(
                pitch * 0.85,
                start + 0.2
            );
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.035, start + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
            chime.connect(gain);
            gain.connect(ctx.destination);
            chime.start(start);
            chime.stop(start + 0.31);
            chime.onended = () => {
                chime.disconnect();
                gain.disconnect();
            };
        }
        const buffer = ctx.createBuffer(
            1,
            Math.ceil(ctx.sampleRate * 0.24),
            ctx.sampleRate
        );
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++)
            data[i] =
                (Math.random() * 2 - 1) * (0.55 + 0.45 * Math.sin(i * 0.045));
        const snow = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        snow.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 2200;
        gain.gain.setValueAtTime(0.045, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);
        snow.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        snow.start(at);
        snow.onended = () => {
            snow.disconnect();
            filter.disconnect();
            gain.disconnect();
        };
    }

    dispose() {
        if (this.context) void this.context.close();
    }
}
