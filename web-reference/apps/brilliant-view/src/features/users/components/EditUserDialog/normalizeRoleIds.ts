export type RoleLike = number | { id: number } | null | undefined;

export function normalizeRoleIds(roles?: RoleLike[]): number[] {
    if (!roles) {
        return [];
    }

    return roles
        .map((role) => {
            if (typeof role === 'number') {
                return role;
            }

            if (role && typeof role === 'object' && 'id' in role) {
                const { id } = role as { id: unknown };
                return typeof id === 'number' ? id : undefined;
            }

            return undefined;
        })
        .filter((roleId): roleId is number => typeof roleId === 'number');
}
