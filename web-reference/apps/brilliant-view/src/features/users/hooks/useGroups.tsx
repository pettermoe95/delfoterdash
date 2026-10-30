import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QUERY_KEY } from '../api/queryKeys';
import type { GroupMembersResponse, GroupsResponse } from '../api/schema';
import { userEndpoints } from '../api/users';

export const useGroupsList = (enabled = true) => {
    return useQuery<GroupsResponse>({
        queryKey: [QUERY_KEY.GROUPS],
        queryFn: () => userEndpoints.listGroups(),
        enabled,
    });
};

export const useGroupMembers = (groupId?: number, enabled = true) => {
    return useQuery<GroupMembersResponse>({
        queryKey: [QUERY_KEY.GROUP_MEMBERS, groupId] as const,
        queryFn: () => userEndpoints.listGroupMembers(groupId as number),
        enabled: enabled && groupId !== undefined,
    });
};

export const useCreateGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => userEndpoints.createGroup(name),
        onSuccess: (createdGroup) => {
            queryClient.setQueryData<GroupsResponse>(
                [QUERY_KEY.GROUPS],
                (previous) => {
                    if (!previous) {
                        return { groups: [createdGroup] };
                    }

                    return {
                        groups: [...previous.groups, createdGroup].sort(
                            (a, b) => a.id - b.id
                        ),
                    };
                }
            );
        },
    });
};

type RenameGroupArgs = {
    groupId: number;
    name: string;
};

export const useRenameGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, name }: RenameGroupArgs) =>
            userEndpoints.renameGroup(groupId, name),
        onSuccess: (updatedGroup) => {
            queryClient.setQueryData<GroupsResponse>(
                [QUERY_KEY.GROUPS],
                (previous) => {
                    if (!previous) {
                        return previous;
                    }

                    return {
                        groups: previous.groups.map((group) =>
                            group.id === updatedGroup.id ? updatedGroup : group
                        ),
                    };
                }
            );
        },
    });
};

export const useDeleteGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupId: number) => userEndpoints.deleteGroup(groupId),
        onSuccess: (_, groupId) => {
            queryClient.setQueryData<GroupsResponse>(
                [QUERY_KEY.GROUPS],
                (previous) => {
                    if (!previous) {
                        return previous;
                    }

                    return {
                        groups: previous.groups.filter(
                            (group) => group.id !== groupId
                        ),
                    };
                }
            );

            queryClient.removeQueries({
                queryKey: [QUERY_KEY.GROUP_MEMBERS, groupId],
            });
        },
    });
};

type GroupMemberMutationArgs = {
    groupId: number;
    userId: number;
};

export const useAddGroupMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, userId }: GroupMemberMutationArgs) =>
            userEndpoints.addGroupMember(groupId, userId),
        onSuccess: async (_, { groupId }) => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GROUP_MEMBERS, groupId],
            });
        },
    });
};

export const useRemoveGroupMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, userId }: GroupMemberMutationArgs) =>
            userEndpoints.removeGroupMember(groupId, userId),
        onSuccess: async (_, { groupId }) => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GROUP_MEMBERS, groupId],
            });
        },
    });
};

export function getGroupErrorMessage(error: unknown): string | null {
    if (error instanceof AxiosError) {
        if (typeof error.response?.data === 'string') {
            return error.response.data;
        }

        if (typeof error.message === 'string' && error.message.length > 0) {
            return error.message;
        }
    }

    if (error instanceof Error && error.message.length > 0) {
        return error.message;
    }

    return null;
}
