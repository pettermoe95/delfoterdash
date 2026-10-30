import z from 'zod';

/**
 * Zod Schemas for Schema requests
 */
export const querySchemaColumnSchema = z.object({
    column_name: z.string(),
    column_type: z.string(),
});
export const querySchemaTableSchema = z.object({
    table_name: z.string(),
    links_to: z.array(z.string()),
    columns: z.array(querySchemaColumnSchema),
});
export const querySchemaResponseSchema = z.array(querySchemaTableSchema);

/**
 * Inferred Types for Schema requests
 */
export type QuerySchemaRequest = string[] | undefined;
export type QuerySchemaResponse = z.infer<typeof querySchemaResponseSchema>;
export type QuerySChemaColumn = z.infer<typeof querySchemaColumnSchema>;
export type QuerySChemaTable = z.infer<typeof querySchemaTableSchema>;
