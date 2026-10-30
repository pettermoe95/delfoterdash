import z from 'zod';

/**
 * Zod Schemas for Tokenization
 */
export const tokenizeResponseSchema = z.object({
    parse_result: z.object({
        valid: z.boolean(),
        syntax_error: z.object({
            explanation: z.string(),
        }),
    }),
});
export const syntaxErrorSchema = z.object({
    explanation: z.string(),
});
export const tokenizeRequestSchema = z.object({
    query: z.string(),
});

/**
 * Inferred Types for Tokenization
 */
export type TokenizeRequest = z.infer<typeof tokenizeRequestSchema>;
export type TokenizeResponse = z.infer<typeof tokenizeResponseSchema>;
export type SyntaxError = z.infer<typeof syntaxErrorSchema>;
