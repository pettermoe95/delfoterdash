// ===================================== //
//        SVG Rendering Utilities        //
// ===================================== //

import { Group } from '@visx/group';
import { degreesToRadians } from '@visx/shape';
import type { SVGProps } from 'react';

/**
 * Generates a triangle standing on a point where
 * left and right sides are equal length:
 *          *------*
 *           \    /
 *            \  /
 *             \/
 * @param angle Angule of bottom
 * @param y Origin Y
 * @param w Width
 * @param h Height
 * @param radius Amount of rounded corner
 * @param props Additional svg properties to inject
 * @returns SVG path element
 */
export function roundedTriangle(
    angle: number,
    length: number,
    cornerRadius: number,
    bottomRadius: number,
    props?: SVGProps<SVGPathElement>
) {
    // Trig
    const a = degreesToRadians(-90);
    const dx1 = Math.cos(a + angle / 2);
    const dy1 = Math.sin(a + angle / 2);
    const dx2 = Math.cos(a - angle / 2);
    const dy2 = Math.sin(a - angle / 2);

    // Triangle points
    type P = { x: number; y: number };
    const pO: P = { x: 0, y: 0 };
    const pL: P = { x: -dx1 * length, y: dy1 * length };
    const pR: P = { x: -dx2 * length, y: dy2 * length };

    // Utility function to lerp between points
    function lp(p1: P, p2: P, p: number) {
        const t = {
            x: p * p2.x + (1 - p) * p1.x,
            y: p * p2.y + (1 - p) * p1.y,
        };
        return `${t.x}, ${t.y}`;
    }

    // Length calculations (edges are sides minus radius)
    const topLen = Math.sqrt((pL.x - pR.x) ** 2 + (pL.y - pR.y) ** 2);
    const edgeTop = cornerRadius / topLen;
    const edgeSide = cornerRadius / length;
    const edgeBot = bottomRadius / length;

    // Move, line and bezier functions.
    // Refer to SVG docs for more information.
    const svgPath = `
        M ${lp(pO, pL, edgeBot)}
        L ${lp(pL, pO, edgeSide)}

        Q ${pL.x}, ${pL.y}, ${lp(pL, pR, edgeTop)}
        L ${lp(pR, pL, edgeTop)}
        Q ${pR.x}, ${pR.y}, ${lp(pR, pO, edgeSide)}

        L ${lp(pO, pR, edgeBot)}
        Q ${pO.x}, ${pO.y}, ${lp(pO, pL, edgeBot)}
    `;
    return (
        <Group>
            <path d={svgPath} fill="none" {...props} />
        </Group>
    );
}
