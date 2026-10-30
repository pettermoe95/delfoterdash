import { SingleSelect } from '@brilliant/bds-core';
import type { ComponentProps } from 'react';
import type { SemanticRelationship } from './semanticModel';

type RelationshipJoinSettingsProps = {
    source: string;
    target: string;
    maximumTargetMatches: SemanticRelationship['maximumTargetMatches'];
    requiredness: SemanticRelationship['requiredness'];
    onMaximumTargetMatchesChange: (
        value: SemanticRelationship['maximumTargetMatches']
    ) => void;
    onRequirednessChange: (value: SemanticRelationship['requiredness']) => void;
};

export function RelationshipJoinSettings({
    source,
    target,
    maximumTargetMatches,
    requiredness,
    onMaximumTargetMatchesChange,
    onRequirednessChange,
}: RelationshipJoinSettingsProps) {
    const maximumTargetMatchesOptions = [
        {
            value: 'ONE',
            label: `ONE — each ${source} row matches at most one ${target} row`,
        },
        {
            value: 'MANY',
            label: 'MANY — potentially unsafe for aggregate joins',
        },
    ];
    const requirednessOptions = [
        {
            value: 'OPTIONAL',
            label: 'OPTIONAL — a missing target is valid',
        },
        {
            value: 'REQUIRED',
            label: 'REQUIRED — a target is expected',
        },
    ];

    const handleMaximumTargetMatchesChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) => onMaximumTargetMatchesChange(value as 'ONE' | 'MANY');

    const handleRequirednessChange: NonNullable<
        ComponentProps<typeof SingleSelect>['onChange']
    > = (value) => onRequirednessChange(value as 'REQUIRED' | 'OPTIONAL');

    return (
        <>
            <label className="block text-sm font-medium">
                Cardinality
                <SingleSelect
                    value={maximumTargetMatches}
                    onChange={handleMaximumTargetMatchesChange}
                    options={maximumTargetMatchesOptions}
                />
            </label>
            {maximumTargetMatches === 'MANY' && (
                <p className="text-sm text-error-primary">
                    The backend will not plan aggregate joins through this edge.
                </p>
            )}
            <label className="block text-sm font-medium">
                Requiredness
                <SingleSelect
                    value={requiredness}
                    onChange={handleRequirednessChange}
                    options={requirednessOptions}
                />
            </label>
            <p className="rounded bg-secondary p-3 text-sm text-secondary">
                This relationship will use an{' '}
                <b>{requiredness === 'REQUIRED' ? 'INNER' : 'LEFT'}</b> join.
                Required relationships remove source rows without a match;
                optional relationships retain them.
            </p>
        </>
    );
}
