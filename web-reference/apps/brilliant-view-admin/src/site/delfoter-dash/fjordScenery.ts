// Frostbyte Fjord: glacier silhouettes, faceted ice, snowfall and aurora curtains.
export function paintFjord(
    ctx: CanvasRenderingContext2D,
    width: number,
    run: number,
    time: number
) {
    ctx.save();
    for (let ribbon = 0; ribbon < 3; ribbon++) {
        const gradient = ctx.createLinearGradient(0, 60, 0, 285);
        gradient.addColorStop(0, '#a7f8ee00');
        gradient.addColorStop(0.5, ribbon % 2 ? '#bdadff25' : '#75e9e729');
        gradient.addColorStop(1, '#75e9e700');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-10, 100);
        for (let x = -10; x <= width + 30; x += 24)
            ctx.lineTo(
                x,
                100 +
                    ribbon * 30 +
                    Math.sin(x * 0.006 + time * 0.25 + ribbon) * 45
            );
        for (let x = width + 30; x >= -10; x -= 24)
            ctx.lineTo(
                x,
                240 +
                    ribbon * 20 +
                    Math.sin(x * 0.006 + time * 0.25 + ribbon) * 35
            );
        ctx.closePath();
        ctx.fill();
    }
    for (let layer = 0; layer < 2; layer++) {
        const spacing = layer ? 180 : 270,
            speed = layer ? 0.2 : 0.08,
            offset = (run * speed) % spacing;
        for (let i = -1; i < width / spacing + 1; i++) {
            const x = i * spacing - offset,
                seed = i + Math.floor((run * speed) / spacing),
                height = 90 + Math.abs(Math.sin(seed * 2.9 + layer)) * 170;
            ctx.fillStyle = layer ? '#173c55' : '#102c44';
            ctx.beginPath();
            ctx.moveTo(x - 40, 450);
            ctx.lineTo(x + 45, 450 - height);
            ctx.lineTo(x + 90, 450 - height * 0.7);
            ctx.lineTo(x + 150, 450);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = layer ? '#29576c' : '#193d55';
            ctx.beginPath();
            ctx.moveTo(x + 45, 450 - height);
            ctx.lineTo(x + 65, 450);
            ctx.lineTo(x + 150, 450);
            ctx.lineTo(x + 90, 450 - height * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#8fd2ef22';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 45, 450 - height);
            ctx.lineTo(x + 65, 450);
            ctx.stroke();
        }
    }
    ctx.fillStyle = '#d7f8ff';
    for (let i = 0; i < 35; i++) {
        ctx.globalAlpha = 0.2 + (i % 3) * 0.12;
        const x =
            (((i * 137 - run * 0.11 + Math.sin(time + i) * 6) % width) +
                width) %
            width;
        const y = (i * 73 + time * 12) % 440;
        ctx.fillRect(x, y, i % 4 ? 1.5 : 3, 1.5);
    }
    ctx.restore();
}
