import type {
    ConceptType,
    ValidateConceptExpressionRequest,
    ValidateConceptExpressionResponse,
} from '@bv/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { conceptsEndpoints } from '../api/concepts';
import { QUERY_KEY } from '../api/queryKeys';

interface UseValidateConceptExpressionParams {
    expression: string;
    type: ConceptType;
}

export const useValidateConceptExpression = ({
    expression,
    type,
}: UseValidateConceptExpressionParams) => {
    const requestPayload: ValidateConceptExpressionRequest = {
        expression,
        type,
    };
    const canValidate = !!expression;

    const config = {
        queryKey: [QUERY_KEY.EXPRESSION, expression, type] as const,
        queryFn: () =>
            conceptsEndpoints.validateConceptExpression(requestPayload),
        placeholderData: keepPreviousData,
        gcTime: 1000 * 60 * 60, // 1 hour
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: canValidate,
    };

    return useQuery<ValidateConceptExpressionResponse>(config);
};
