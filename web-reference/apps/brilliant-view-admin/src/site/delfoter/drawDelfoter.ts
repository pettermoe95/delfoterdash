export function drawDelfoter(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    elapsed: number,
    eating = false
) {
    const pixel = (
        color: string,
        left: number,
        top: number,
        width: number,
        height: number
    ) => {
        context.fillStyle = color;
        context.fillRect(x + left * 3, y + top * 3, width * 3, height * 3);
    };
    const tailWag = Math.round(Math.sin(elapsed * 9));
    const rearPaddle = Math.round(Math.sin(elapsed * 7));

    // Long tapered tail with dolphin flukes, followed by a slim otter body.
    pixel('#526779', 0, 3 + tailWag, 2, 3);
    pixel('#526779', 0, 8 + tailWag, 2, 3);
    pixel('#6f8799', 2, 5 + tailWag, 3, 4);
    pixel('#8fa5b2', 4, 6 + tailWag, 5, 2);
    pixel('#6f8799', 8, 6, 5, 3);
    pixel('#526779', 12, 4, 18, 6);
    pixel('#526779', 14, 3, 14, 8);
    pixel('#8fa5b2', 13, 4, 18, 4);
    pixel('#aebec5', 15, 4, 14, 2);
    pixel('#d8e5e6', 16, 8, 15, 2);

    // Two pairs of little paddling legs and webbed feet.
    pixel('#526779', 14, 10, 2, 2 + rearPaddle);
    pixel('#6f8799', 13, 12 + rearPaddle, 4, 1);
    pixel('#6f8799', 18, 10, 2, 2 - rearPaddle);
    pixel('#526779', 17, 12 - rearPaddle, 4, 1);
    pixel('#526779', 27, 9, 2, 3 - rearPaddle);
    pixel('#6f8799', 26, 12 - rearPaddle, 4, 1);
    pixel('#6f8799', 30, 9, 2, 3 + rearPaddle);
    pixel('#526779', 29, 12 + rearPaddle, 4, 1);

    // Rounded ears, pale muzzle, shiny eye, and pink cheek.
    pixel('#526779', 29, 1, 2, 2);
    pixel('#526779', 33, 1, 2, 2);
    pixel('#aebec5', 30, 2, 5, 6);
    pixel('#8fa5b2', 29, 3, 7, 6);
    pixel('#d8e5e6', 33, 6, 5, 3);
    pixel('#263e50', 33, 4, 1, 1);
    context.fillStyle = '#ffffff';
    context.fillRect(x + 99, y + 12, 1, 1);
    pixel('#263e50', 37, 6, 1, 1);
    pixel('#e8a4b2', 34, 7, 1, 1);
    pixel('#aebec5', 36, 8, 2, 1);
    if (eating) {
        const chewing = Math.floor(elapsed * 14) % 2 === 0;
        pixel('#263e50', 36, 7, 2, chewing ? 2 : 1);
        if (chewing) pixel('#efb4bc', 36, 8, 1, 1);
    }
}
