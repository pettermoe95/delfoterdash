import { z } from 'zod';

export const userItemSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    roles: z.array(z.number()),
    picture_url: z.string().optional(),
    last_active_at: z
        .string()
        .datetime({ local: true })
        .transform((d) => (!d.endsWith('Z') ? d + 'Z' : d))
        .nullable(),
});

export const usersSchema = z.array(userItemSchema);

export type UserItem = z.infer<typeof userItemSchema>;
export type UsersList = z.infer<typeof usersSchema>;

export const userRoleItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
});

export const userRolesListSchema = z.array(userRoleItemSchema);

export type UserRoleItem = z.infer<typeof userRoleItemSchema>;
export type UserRoleList = z.infer<typeof userRolesListSchema>;

export const groupItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    system_group: z.boolean(),
});

export const groupsResponseSchema = z.object({
    groups: z.array(groupItemSchema),
});

export type GroupItem = z.infer<typeof groupItemSchema>;
export type GroupsResponse = z.infer<typeof groupsResponseSchema>;

export const groupMemberSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
});

export const groupMembersResponseSchema = z.object({
    members: z.array(groupMemberSchema),
});

export type GroupMembersResponse = z.infer<typeof groupMembersResponseSchema>;

export const addGroupMemberRequestSchema = z.object({
    user_id: z.number(),
});

export const removeGroupMemberRequestSchema = z.object({
    user_id: z.number(),
});

export type AddGroupMemberRequest = z.infer<typeof addGroupMemberRequestSchema>;

export type RemoveGroupMemberRequest = z.infer<
    typeof removeGroupMemberRequestSchema
>;
