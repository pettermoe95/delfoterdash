import type { CylinderGraphFormat } from '@bv/api';
import type { Control, FieldPath } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

const targetGraphFields = [
    'target',
    'concept',
    'display.target',
    'alltimeData',
    'conceptTimeFilter',
    'targetTimeFilter',
    'display.showDecimals',
] as const satisfies readonly FieldPath<CylinderGraphFormat>[];

export function useTargetGraphFormValues<T extends CylinderGraphFormat>(
    control: Control<T>
) {
    const [
        formTarget,
        formConcept,
        formDisplay,
        formAlltimeData,
        formConceptTimeFilterValue,
        formTargetTimeFilterValue,
        showDecimals,
    ] = useWatch({
        // RHF controls are invariant; this hook only reads fields guaranteed by T.
        control: control as unknown as Control<CylinderGraphFormat>,
        name: targetGraphFields,
    });

    return {
        formTarget,
        formConcept,
        formDisplay,
        formConceptTimeFilter: formConceptTimeFilterValue ?? !formAlltimeData,
        formTargetTimeFilter: formTargetTimeFilterValue ?? !formAlltimeData,
        showDecimals,
    };
}
