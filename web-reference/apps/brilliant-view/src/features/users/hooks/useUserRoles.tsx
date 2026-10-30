import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { QUERY_KEY } from '../api/queryKeys';
import type { UserRoleList } from '../api/schema';
import { userEndpoints } from '../api/users';

export const useUserRoles = () => {
    const { hasPermission } = useAccount();
    const localize = useLocalize();

    const config = {
        queryKey: [QUERY_KEY.USER_ROLES] as const,
        queryFn: () => userEndpoints.listUserRoles(),
        select: (roles: UserRoleList): UserRoleList =>
            roles.map((role) => {
                const key = role.name.replace(/\s/g, '');
                const nameKey = `users.roles.${key}.name`;
                const descriptionKey = `users.roles.${key}.description`;
                const name = localize(nameKey);
                const description = localize(descriptionKey);

                return {
                    ...role,
                    name: name === nameKey ? role.name : name,
                    description:
                        description === descriptionKey
                            ? role.description
                            : description,
                };
            }),
        placeholderData: keepPreviousData,
        gcTime: 1000 * 60 * 60, // 1 hour
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: hasPermission(PERMISSION.USERS_ROLES_READ),
    };

    return useQuery<UserRoleList>(config);
};

type UpdateUserRolesArgs = { userId: number; roles: number[] };

export const useUpdateUserRoles = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, roles }: UpdateUserRolesArgs) =>
            userEndpoints.updateUserRoles(roles, userId),
        onSuccess: () => {
            // Refresh users list after update
            void queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.USERS],
            });
        },
    });
};
