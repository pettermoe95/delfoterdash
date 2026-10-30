// Ten original compositions: different motifs, chord progressions, rhythms and instruments.
// Regenerate: node apps/brilliant-view-admin/scripts/generate-dash-soundtracks.mjs
import { writeFileSync } from 'node:fs';

const rate = 22050;
const songs = [
    {
        id: 'boardwalk',
        bpm: 132,
        voice: 'triangle',
        gate: 1.3,
        roots: [45, 41, 48, 43, 45, 48, 41, 43],
        melody: [0, -1, 7, -1, 12, 10, 7, -1, 3, -1, 5, 7, 10, -1, 7, -1],
        bass: [0, -1, -1, 7, -1, -1, 12, -1, 0, -1, -1, 7, -1, 12, -1, -1],
        kick: [0, 6, 8, 14],
        snare: [4, 12],
        hat: 2,
        pad: 0.025,
    },
    {
        id: 'reef',
        bpm: 144,
        voice: 'saw',
        gate: 0.45,
        roots: [38, 38, 41, 36, 38, 43, 41, 36],
        melody: [0, 0, -1, 3, 7, -1, 10, 7, -1, 12, 10, -1, 7, 3, 5, -1],
        bass: [0, 0, -1, 0, -1, 7, -1, 12, 0, -1, 0, 7, -1, 0, 12, -1],
        kick: [0, 3, 7, 10, 14],
        snare: [4, 12],
        hat: 1,
        pad: 0,
    },
    {
        id: 'overdrive',
        bpm: 148,
        voice: 'bell',
        gate: 2.4,
        roots: [48, 43, 45, 41, 48, 45, 43, 41],
        melody: [0, -1, -1, 7, 12, -1, 14, -1, 16, -1, -1, 14, 12, -1, 7, -1],
        bass: [0, -1, 12, -1, 7, -1, 12, -1, 0, -1, 12, -1, 7, -1, 12, -1],
        kick: [0, 4, 8, 12],
        snare: [4, 12],
        hat: 2,
        pad: 0.045,
    },
    {
        id: 'skyline',
        bpm: 152,
        voice: 'pluck',
        gate: 1.8,
        roots: [41, 48, 45, 43, 41, 45, 48, 43],
        melody: [12, -1, 7, 5, -1, 0, -1, 5, 7, -1, 12, -1, 17, 12, -1, 7],
        bass: [0, -1, -1, -1, 7, -1, 0, -1, -1, -1, 12, -1, 7, -1, -1, -1],
        kick: [0, 7, 10],
        snare: [8],
        hat: 2,
        pad: 0.04,
    },
    {
        id: 'coastline',
        bpm: 158,
        voice: 'square',
        gate: 0.75,
        roots: [45, 48, 43, 40, 45, 41, 43, 40],
        melody: [0, 7, 12, -1, 15, 12, 10, 7, 3, 7, 10, -1, 12, 10, 7, 3],
        bass: [0, -1, 0, 12, 0, -1, 7, 0, 0, -1, 0, 12, 7, -1, 0, 12],
        kick: [0, 3, 6, 8, 11, 14],
        snare: [4, 12, 15],
        hat: 1,
        pad: 0.02,
    },
    {
        id: 'frost-arrival',
        bpm: 140,
        voice: 'bell',
        gate: 3.1,
        roots: [50, 45, 47, 43, 50, 47, 45, 43],
        melody: [12, -1, -1, -1, 7, -1, -1, 2, 0, -1, -1, -1, 5, -1, 7, -1],
        bass: [0, -1, -1, -1, -1, -1, 7, -1, 0, -1, -1, -1, -1, -1, 12, -1],
        kick: [0, 10],
        snare: [8],
        hat: 2,
        pad: 0.065,
    },
    {
        id: 'icebreaker',
        bpm: 148,
        voice: 'square',
        gate: 0.35,
        roots: [42, 42, 45, 40, 42, 47, 45, 40],
        melody: [0, -1, 12, 0, -1, 7, 3, -1, 10, 7, -1, 3, 0, -1, 7, 12],
        bass: [0, -1, 7, 0, -1, 12, 0, -1, 0, 7, -1, 0, 12, -1, 7, -1],
        kick: [0, 3, 6, 10, 13],
        snare: [4, 12],
        hat: 1,
        pad: 0.015,
    },
    {
        id: 'aurora-ascent',
        bpm: 154,
        voice: 'triangle',
        gate: 2.8,
        roots: [43, 50, 47, 45, 43, 47, 50, 45],
        melody: [7, -1, 12, -1, 14, -1, 19, -1, 17, -1, 14, -1, 12, 7, -1, -1],
        bass: [0, -1, -1, 12, 7, -1, -1, 12, 0, -1, -1, 12, 7, -1, -1, 12],
        kick: [0, 4, 8, 12],
        snare: [4, 12],
        hat: 2,
        pad: 0.06,
    },
    {
        id: 'polar-flux',
        bpm: 160,
        voice: 'pluck',
        gate: 0.65,
        roots: [47, 43, 50, 45, 47, 50, 43, 45],
        melody: [0, 3, 7, 12, 7, 3, 0, 10, 14, 10, 7, 3, 7, 12, 15, 12],
        bass: [0, -1, 0, -1, 7, 0, -1, 12, 0, -1, 7, 0, -1, 12, -1, 7],
        kick: [0, 4, 7, 8, 12, 15],
        snare: [4, 12],
        hat: 1,
        pad: 0.035,
    },
    {
        id: 'fjord-reactor',
        bpm: 168,
        voice: 'saw',
        gate: 0.55,
        roots: [40, 43, 38, 35, 40, 36, 38, 35],
        melody: [0, 0, 7, 12, -1, 10, 7, 3, 0, 7, 15, 12, 10, 7, 3, -1],
        bass: [0, 0, 12, -1, 0, 7, 0, 12, 0, 0, 12, -1, 7, 0, 12, 7],
        kick: [0, 2, 6, 8, 10, 14],
        snare: [4, 12, 14, 15],
        hat: 1,
        pad: 0.025,
    },
];
function wave(voice, f, t) {
    if (voice === 'triangle')
        return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * f * t));
    if (voice === 'bell')
        return (
            Math.sin(2 * Math.PI * f * t) +
            0.45 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 12) +
            0.2 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 20)
        );
    if (voice === 'pluck')
        return (
            Math.sin(2 * Math.PI * f * t) +
            0.35 * Math.sin(2 * Math.PI * f * 2 * t) +
            0.15 * Math.sin(2 * Math.PI * f * 3 * t)
        );
    let result = 0;
    for (let h = 1; h <= 9 && f * h < rate / 2; h += voice === 'square' ? 2 : 1)
        result +=
            (Math.sin(2 * Math.PI * f * h * t) / h) *
            (voice === 'saw' && h % 2 === 0 ? -0.7 : 1);
    return result * 0.8;
}
for (const song of songs) {
    const step = 60 / song.bpm / 4,
        data = new Float64Array(Math.round(128 * step * rate));
    const add = (at, duration, voice) => {
        const start = Math.round(at * rate);
        for (let i = 0; i < duration * rate; i++)
            data[(start + i) % data.length] += voice(i / rate);
    };
    const note = (pitch, at, duration, volume, voice) => {
        const f = 440 * 2 ** ((pitch - 69) / 12);
        add(
            at,
            duration,
            (t) =>
                wave(voice, f, t) *
                volume *
                Math.min(1, t / 0.006) *
                Math.exp((-5 * t) / duration)
        );
    };
    for (let i = 0; i < 128; i++) {
        const bar = Math.floor(i / 16),
            beat = i % 16,
            root = song.roots[bar],
            at = i * step,
            pitch = song.melody[beat];
        if (pitch >= 0)
            note(
                root + 12 + pitch + (bar === 7 && beat > 11 ? 12 : 0),
                at,
                step * song.gate,
                0.115,
                song.voice
            );
        const bass = song.bass[beat];
        if (bass >= 0) note(root - 12 + bass, at, step * 1.8, 0.28, 'triangle');
        if (beat === 0 && song.pad)
            for (const interval of [0, 3, 7])
                note(root + 12 + interval, at, step * 12, song.pad, 'triangle');
        if (song.kick.includes(beat))
            add(
                at,
                0.2,
                (t) =>
                    Math.sin(
                        2 * Math.PI * (43 * t + 6 * (1 - Math.exp(-32 * t)))
                    ) *
                    0.5 *
                    Math.exp(-25 * t)
            );
        if (beat % song.hat === 0 || song.snare.includes(beat)) {
            let seed = i * 3911 + song.id.length * 113,
                previous = 0;
            const snare = song.snare.includes(beat);
            add(at, snare ? 0.12 : 0.045, (t) => {
                seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
                const white = (seed / 2 ** 32) * 2 - 1;
                const high = white - previous * 0.7;
                previous = white;
                return (
                    high *
                    Math.exp(-t * (snare ? 35 : 110)) *
                    (snare ? 0.17 : 0.035)
                );
            });
        }
    }
    const peak = data.reduce((max, v) => Math.max(max, Math.abs(v)), 0),
        wav = Buffer.alloc(44 + data.length * 2);
    wav.write('RIFF', 0);
    wav.writeUInt32LE(wav.length - 8, 4);
    wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(rate, 24);
    wav.writeUInt32LE(rate * 2, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write('data', 36);
    wav.writeUInt32LE(data.length * 2, 40);
    for (let i = 0; i < data.length; i++) {
        const fade = Math.min(
            1,
            i / (rate * 0.004),
            (data.length - 1 - i) / (rate * 0.008)
        );
        wav.writeInt16LE(
            Math.round((data[i] / peak) * 0.72 * fade * 32767),
            44 + i * 2
        );
    }
    writeFileSync(
        new URL(`../public/delfoter-dash/${song.id}.wav`, import.meta.url),
        wav
    );
}
