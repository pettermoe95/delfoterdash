import type { z } from 'zod';
import { Field } from './Field';
import type { FormEnvironment } from './Field';
import { ObjectFields } from './ObjectFields';
import { objectSchema } from './schema';

type SchemaFormProps = {
    schema: z.ZodTypeAny;
    value: unknown;
    onChange: (value: unknown) => void;
    environment?: FormEnvironment;
    section?: string;
    pathPrefix?: string;
    exclude?: string[];
};
export function SchemaForm({
    schema,
    value,
    onChange,
    environment = {},
    section,
    pathPrefix = '',
    exclude = [],
}: SchemaFormProps) {
    const object = objectSchema(schema, value);
    if (!object)
        return (
            <Field
                schema={schema}
                value={value}
                onChange={onChange}
                environment={environment}
                path="configuration"
            />
        );
    return (
        <ObjectFields
            schema={schema}
            object={object}
            value={value}
            onChange={onChange}
            environment={environment}
            section={section}
            pathPrefix={pathPrefix}
            exclude={exclude}
        />
    );
}
