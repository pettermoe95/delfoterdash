import type {
    Concept,
    ConceptPayload,
    ConceptStats,
    ConceptStatsRequest,
    ValidateConceptExpressionRequest,
    ValidateConceptExpressionResponse,
} from '@bv/api';
import { apiService } from '~/api/service';

export const conceptsEndpoints = {
    listEditableConcepts: () =>
        apiService.getData<Concept[]>('v1/concepts/editable'),
    validateConceptExpression: (params: ValidateConceptExpressionRequest) =>
        apiService.getData<ValidateConceptExpressionResponse>(
            'v1/concepts/validate_expression',
            params
        ),
    conceptUsage: (conceptName: string) =>
        apiService.postData<ConceptStats, ConceptStatsRequest>(
            'v1/concepts/usage',
            {
                concept_name: conceptName,
            }
        ),
    createConcept: (params: ConceptPayload) =>
        apiService.postData<Concept, ConceptPayload>('v1/concepts', params),
    updateConcept: (params: ConceptPayload) =>
        apiService.patchData<Concept, ConceptPayload>('v1/concepts', params),
    deleteConcept: (conceptName: string) =>
        apiService.deleteData<void, { concept_name: string }>('v1/concepts', {
            concept_name: conceptName,
        }),
};
