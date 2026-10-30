import { z } from 'zod';

export const baseAccountSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    picture_url: z.string().nullable(),
});

export type BaseAccount = z.infer<typeof baseAccountSchema>;

export const accountSchema = z.object({
    id: z.number(),
    full_name: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone_number: z.string().nullable(),
    picture_url: z.string().nullable(),
    created_at: z.string().datetime(),
});

export type Account = z.infer<typeof accountSchema>;

export const createdByAccountSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    picture_url: z.string().nullable(),
});

export type CreatedByAccount = z.infer<typeof createdByAccountSchema>;

export const accountPermissionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
});

export type AccountPermission = z.infer<typeof accountPermissionSchema>;

// Runtime schema is intentionally private and used to derive the exported type.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const aboutMeResponseSchema = z.object({
    user: accountSchema,
    organization: z.object({
        name: z.string(),
        organization_number: z.string(),
        use_dummy_data: z.boolean().optional(),
    }),
    permissions: z.array(accountPermissionSchema).optional(),
    impersonator: accountSchema.nullable().optional(),
});

export type AboutMeResponse = z.infer<typeof aboutMeResponseSchema>;
