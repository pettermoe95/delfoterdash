import { apiService } from '~/api/service';
import type {
    AddGroupMemberRequest,
    GroupItem,
    GroupMembersResponse,
    GroupsResponse,
    RemoveGroupMemberRequest,
    UserRoleList,
    UsersList,
} from './schema';

export const userEndpoints = {
    listUsers: () => apiService.getData<UsersList>('v1/admin/users'),
    listUserRoles: () => apiService.getData<UserRoleList>('v1/admin/roles'),
    updateUserRoles: (roles: number[], userId: number) =>
        apiService.postData<{ success: true }, { roles: number[] }>(
            `v1/admin/users/${userId}/roles`,
            {
                roles,
            }
        ),
    listGroups: () => apiService.getData<GroupsResponse>('v1/groups'),
    createGroup: (name: string) =>
        apiService.postData<GroupItem, { name: string }>('v1/groups', {
            name,
        }),
    renameGroup: (groupId: number, name: string) =>
        apiService.patchData<GroupItem, { name: string }>(
            `v1/groups/${groupId}`,
            {
                name,
            }
        ),
    deleteGroup: (groupId: number) =>
        apiService.deleteData(`v1/groups/${groupId}`, {}),
    listGroupMembers: (groupId: number) =>
        apiService.getData<GroupMembersResponse>(
            `v1/groups/${groupId}/members`
        ),
    addGroupMember: (groupId: number, userId: number) =>
        apiService.postData<void, AddGroupMemberRequest>(
            `v1/groups/${groupId}/add-member`,
            {
                user_id: userId,
            }
        ),
    removeGroupMember: (groupId: number, userId: number) =>
        apiService.postData<void, RemoveGroupMemberRequest>(
            `v1/groups/${groupId}/remove-member`,
            {
                user_id: userId,
            }
        ),
};
