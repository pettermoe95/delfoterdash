import { ENEMIES } from './enemies';
import { ROBOT_ART, robotFill } from './robotArtwork';
import { TOWERS } from './towers';
import type { EnemyKind, TowerKind } from './types';

// Defender portraits and distinct robot silhouettes share their content with the battlefield.
export function Delfoter({
    tower,
    enemy,
    angle = 0,
}: {
    tower?: TowerKind;
    enemy?: EnemyKind;
    angle?: number;
}) {
    const definition = enemy ? ENEMIES[enemy] : TOWERS[tower ?? 'spritz'];
    const sprite = definition.appearance.sprite;
    if (sprite.type === 'image')
        return (
            <svg
                x={-sprite.width / 2}
                y={-sprite.height / 2}
                width={sprite.width}
                height={sprite.height}
                viewBox={`0 0 ${sprite.frameWidth} ${sprite.frameHeight}`}
                overflow="hidden"
            >
                <image
                    href={sprite.src}
                    width={sprite.frameWidth * sprite.frames}
                    height={sprite.frameHeight}
                />
            </svg>
        );
    if (sprite.type === 'robot')
        return (
            <g>
                {ROBOT_ART[sprite.shape].map((part, index) => (
                    <path
                        key={index}
                        d={part.path}
                        fill={robotFill(part.fill, definition.color)}
                        stroke={part.stroke}
                        strokeWidth={part.width}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                ))}
            </g>
        );
    const accent = definition.color;
    const equipment = sprite.equipment;
    const fur = '#7899a9';
    return (
        <g>
            <ellipse cy="24" rx="32" ry="9" fill="#0f172a" opacity=".15" />
            <path
                d="M-19 10 Q-40 15 -41 -4 L-52 -10 L-48 4 L-55 13 Q-32 24 -16 18"
                fill={fur}
                stroke="#334155"
                strokeWidth="2"
            />
            <ellipse
                cy="9"
                rx="25"
                ry="20"
                fill={fur}
                stroke="#334155"
                strokeWidth="2"
            />
            <ellipse cx="4" cy="15" rx="15" ry="12" fill="#deedf0" />
            <ellipse cx="-13" cy="26" rx="10" ry="5" fill={fur} />
            <ellipse cx="20" cy="26" rx="10" ry="5" fill={fur} />
            <circle
                cx="-11"
                cy="-17"
                r="7"
                fill={fur}
                stroke="#334155"
                strokeWidth="2"
            />
            <circle
                cx="16"
                cy="-17"
                r="7"
                fill={fur}
                stroke="#334155"
                strokeWidth="2"
            />
            <ellipse
                cx="4"
                cy="-4"
                rx="23"
                ry="21"
                fill={fur}
                stroke="#334155"
                strokeWidth="2"
            />
            <ellipse cx="14" cy="3" rx="17" ry="9" fill="#e5f2f3" />
            <>
                <circle cx="-4" cy="-7" r="3.5" fill="#183447" />
                <circle cx="12" cy="-7" r="3.5" fill="#183447" />
                <circle cx="-3" cy="-8" r="1.2" fill="white" />
                <circle cx="13" cy="-8" r="1.2" fill="white" />
                <ellipse cx="26" cy="0" rx="4" ry="3" fill="#183447" />
                <ellipse cx="-7" cy="2" rx="4" ry="2.5" fill="#f5a5b5" />
                <path
                    d="M6 5 Q12 11 18 5"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1.5"
                />
                <path
                    d="M-19 -16 Q2 -29 24 -16"
                    stroke={accent}
                    strokeWidth="6"
                    fill="none"
                />
                <g transform={`rotate(${angle})`}>
                    {equipment === 'blaster' ? (
                        <>
                            <rect
                                x="7"
                                y="7"
                                width="35"
                                height="12"
                                rx="4"
                                fill={accent}
                                stroke="#5b21b6"
                                strokeWidth="2"
                            />
                            <rect
                                x="15"
                                y="0"
                                width="14"
                                height="10"
                                rx="3"
                                fill="#a5f3fc"
                            />
                            <rect
                                x="39"
                                y="9"
                                width="10"
                                height="7"
                                rx="2"
                                fill="#475569"
                            />
                        </>
                    ) : null}
                    {equipment === 'rifle' ? (
                        <>
                            <rect
                                x="8"
                                y="8"
                                width="49"
                                height="7"
                                rx="2"
                                fill="#334155"
                            />
                            <rect
                                x="9"
                                y="7"
                                width="20"
                                height="10"
                                rx="3"
                                fill={accent}
                            />
                            <rect
                                x="21"
                                y="0"
                                width="16"
                                height="5"
                                rx="2"
                                fill="#334155"
                            />
                        </>
                    ) : null}
                </g>
            </>
        </g>
    );
}

export function DelfoterPortrait({
    tower,
    enemy,
}: {
    tower?: TowerKind;
    enemy?: EnemyKind;
}) {
    return (
        <svg
            viewBox={
                (enemy ? ENEMIES[enemy] : TOWERS[tower ?? 'spritz']).appearance
                    .portraitViewBox ?? '-60 -48 125 90'
            }
            aria-hidden="true"
            className="td-portrait"
        >
            <Delfoter tower={tower} enemy={enemy} />
        </svg>
    );
}
