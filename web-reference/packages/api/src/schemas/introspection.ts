import { z } from 'zod';

export const ColumnSpecificationSchema = z.object({
    name: z.string(),
    data_type: z.string(),
});

export const TableSpecificationSchema = z.object({
    name: z.string(),
    schema: z.string(),
    columns: z.array(ColumnSpecificationSchema),
});

// Infer the TypeScript type directly from the schema (optional)
export type ColumnSpecification = z.infer<typeof ColumnSpecificationSchema>;
export type TableSpecification = z.infer<typeof TableSpecificationSchema>;
