import { useLocalize } from '~/i18n/I18nContext';
import { useFieldConcepts } from './useFieldConcepts';

// year, quarter, month, week, day_of_week, day_of_year, date, is_weekend
const DEFAULT_FIELD_CONCEPTS = [
    'year',
    'quarter',
    'month',
    'week',
    'day_of_week',
    'day_of_year',
    'date',
    'is_weekend',
];

export function useLocalizeFieldConcepts() {
    const { data: conceptFields } = useFieldConcepts();
    const localize = useLocalize();

    const localizedConcepts = conceptFields?.map((val) => ({
        ...val,
        concept_name_pretty: DEFAULT_FIELD_CONCEPTS.includes(val.concept_name)
            ? localize(`time.${val.concept_name}`)
            : val.concept_name_pretty,
    }));

    return localizedConcepts;
}
