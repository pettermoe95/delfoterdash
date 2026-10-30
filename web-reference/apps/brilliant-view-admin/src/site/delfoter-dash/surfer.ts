// Shared original character art for the course and arcade card.
export function drawSurfer(
    ctx: CanvasRenderingContext2D,
    time: number,
    accent = '#55f1ed',
    airborne = false,
    flip = 0
) {
    ctx.save();
    if (airborne) ctx.rotate(Math.min(1, flip / 0.62) * Math.PI * 2);
    else ctx.rotate(Math.sin(time * 7) * 0.035 - 0.07);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    const path = (d: string, fill: string, stroke = '#15334f') => {
        const p = new Path2D(d);
        ctx.fillStyle = fill;
        ctx.fill(p);
        ctx.strokeStyle = stroke;
        ctx.stroke(p);
    };
    path(
        'M-17 0 Q-37 4 -41 -14 L-57 -22 L-50 -6 L-57 3 Q-33 18 -15 12Z',
        '#548ca8'
    );
    ctx.fillStyle = '#8bbfd0';
    ctx.strokeStyle = '#173750';
    ctx.beginPath();
    ctx.ellipse(-2, 0, 20, 18, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dbf4ef';
    ctx.beginPath();
    ctx.ellipse(5, 4, 11, 13, -0.2, 0, Math.PI * 2);
    ctx.fill();
    path('M-17 9 L-23 22 L-11 23 L-3 12 M7 10 L15 22 L28 22 L19 9', '#6ba4b9');
    ctx.fillStyle = '#77acc2';
    for (const x of [-12, 15]) {
        ctx.beginPath();
        ctx.arc(x, -29, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(5, -18, 22, 19, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    path('M-16 -28 Q-9 -44 10 -40 L24 -30 L39 -28 L13 -23Z', accent);
    path(
        'M-11 -24 L3 -24 L5 -14 L-8 -15Z M8 -24 L23 -24 L20 -14 L8 -14Z',
        '#0a1835'
    );
    path('M-7 -21 L0 -19 M12 -21 L18 -19 M3 -21 L9 -21', '#7bedff', '#7bedff');
    ctx.fillStyle = '#e6fbf4';
    ctx.beginPath();
    ctx.ellipse(22, -8, 13, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10223b';
    ctx.beginPath();
    ctx.ellipse(33, -11, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#27506a';
    ctx.beginPath();
    ctx.moveTo(15, -6);
    ctx.quadraticCurveTo(22, 0, 27, -5);
    ctx.stroke();
    path(
        'M-12 -4 Q-25 -1 -27 -11 L-32 -7 Q-27 7 -13 6 M12 -3 Q28 -1 32 9 L37 5 Q30 -9 15 -9',
        '#86b8ca'
    );
    path('M-16 -3 L-24 -8 L-31 4 L-43 2 L-28 12 L-19 2Z', '#fb78be');
    // A luminous surfboard, with fins and a water-powered hover wake.
    ctx.shadowColor = accent;
    ctx.shadowBlur = 13;
    path(
        'M-43 25 Q-20 33 26 26 Q41 23 48 16 Q43 32 20 34 L-25 35Z',
        '#182c51',
        accent
    );
    path('M-32 27 Q1 32 33 25', accent, accent);
    ctx.shadowBlur = 0;
    path('M-22 34 L-14 43 L-10 34', accent);
    ctx.restore();
}
