// Original arcade composition, rendered ahead of time for native media autoplay.
// Regenerate: node apps/brilliant-view-admin/scripts/generate-arcade-soundtrack.mjs
import { writeFileSync } from 'node:fs';

const melody = [
    76, 0, 79, 83, 81, 79, 76, 0, 74, 76, 79, 0, 74, 0, 71, 74, 72, 0, 76, 79,
    81, 79, 76, 0, 72, 74, 76, 0, 79, 0, 76, 74, 74, 0, 77, 81, 83, 81, 77, 0,
    74, 76, 77, 0, 81, 0, 79, 77, 71, 0, 74, 79, 78, 74, 71, 0, 74, 78, 81, 79,
    78, 74, 71, 0,
];
const roots = [40, 36, 38, 35];
const rate = 22050;
const step = 60 / 112 / 4;
const samples = new Float64Array(Math.round(melody.length * step * rate));
function tone(note, at, duration, volume, square = false) {
    const frequency = 440 * 2 ** ((note - 69) / 12);
    const start = Math.round(at * rate);
    for (let i = 0; i < duration * rate; i++) {
        const t = i / rate;
        // Limit square-wave harmonics below Nyquist to keep the lead mellow.
        let wave = 0;
        if (square) {
            for (
                let harmonic = 1;
                harmonic <= 9 && frequency * harmonic < rate / 2;
                harmonic += 2
            )
                wave +=
                    Math.sin(2 * Math.PI * frequency * harmonic * t) / harmonic;
            wave *= 4 / Math.PI;
        } else {
            wave =
                (2 / Math.PI) *
                Math.asin(Math.sin(2 * Math.PI * frequency * t));
        }
        const envelope = Math.min(1, t / 0.006) * Math.exp((-7 * t) / duration);
        samples[(start + i) % samples.length] += wave * envelope * volume;
    }
}
let seed = 1741;
for (let index = 0; index < melody.length; index++) {
    const root = roots[Math.floor(index / 16)];
    const at = index * step;
    if (melody[index]) tone(melody[index], at, step * 0.85, 0.18, true);
    if (index % 2 === 0) tone(root + (index % 4 ? 12 : 0), at, step * 1.6, 0.4);
    if (index % 4 === 2)
        tone(
            root + 24 + [0, 7, 12, 7][Math.floor(index / 4) % 4],
            at,
            step * 0.6,
            0.08
        );
    if (index % 4 === 0) {
        for (let i = 0; i < rate * 0.08; i++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const noise = (seed / 0xffffffff) * 2 - 1;
            const envelope = Math.exp((-7 * i) / (rate * 0.08));
            samples[(Math.round(at * rate) + i) % samples.length] +=
                noise * envelope * (index % 8 === 4 ? 0.13 : 0.04);
        }
    }
}
const peak = samples.reduce(
    (highest, value) => Math.max(highest, Math.abs(value)),
    0
);
const output = Buffer.alloc(44 + samples.length * 2);
output.write('RIFF', 0);
output.writeUInt32LE(output.length - 8, 4);
output.write('WAVEfmt ', 8);
output.writeUInt32LE(16, 16);
output.writeUInt16LE(1, 20);
output.writeUInt16LE(1, 22);
output.writeUInt32LE(rate, 24);
output.writeUInt32LE(rate * 2, 28);
output.writeUInt16LE(2, 32);
output.writeUInt16LE(16, 34);
output.write('data', 36);
output.writeUInt32LE(samples.length * 2, 40);
for (let i = 0; i < samples.length; i++)
    output.writeInt16LE(
        Math.round((samples[i] / peak) * 0.65 * 32767),
        44 + i * 2
    );
writeFileSync(
    new URL('../public/delfoter-arcade/arcade-theme.wav', import.meta.url),
    output
);
