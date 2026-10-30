import { z } from 'zod';
import { ArrayField } from './ArrayField';
import type { CollectionFieldProps } from './collectionTypes';
import { RecordField } from './RecordField';

export function CollectionField(props: CollectionFieldProps) {
    return props.schema instanceof z.ZodArray ? (
        <ArrayField {...props} schema={props.schema} />
    ) : (
        <RecordField {...props} schema={props.schema} />
    );
}
