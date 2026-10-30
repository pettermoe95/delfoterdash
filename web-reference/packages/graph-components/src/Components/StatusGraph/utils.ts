export type StatusGraphType = 'targetvalue' | 'compare' | '';

export function getStatusGraphText(
    type: StatusGraphType,
    domainUnit: string | undefined
) {
    switch (type) {
        case 'targetvalue':
            return ` of target value`;
        case 'compare':
            return ` vs last ${domainUnit?.toLocaleLowerCase()}`;
        case '':
        default:
            return ``;
    }
}
