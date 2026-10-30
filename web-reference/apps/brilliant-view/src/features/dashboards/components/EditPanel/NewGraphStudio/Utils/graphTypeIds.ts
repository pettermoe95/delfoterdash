export const GraphTypeId = {
    axis: 1,
    gauge: 2,
    cylinder: 10,
    pie: 4,
    status: 6,
    table: 8,
    funnel: 11,
} as const;

export type GraphTypeId = (typeof GraphTypeId)[keyof typeof GraphTypeId];

const GRAPH_TYPE_IDS = Object.values(GraphTypeId) as readonly GraphTypeId[];

export const isGraphTypeId = (value: number): value is GraphTypeId =>
    GRAPH_TYPE_IDS.includes(value as GraphTypeId);

export const SUPPORTED_GRAPH_TYPE_IDS = GRAPH_TYPE_IDS;
