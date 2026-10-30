import type {
    CreateCredentialFormValues,
    UpdateCredentialFormValues,
} from '@bv/api';
import { createCredentialSchema, updateCredentialSchema } from '@bv/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CredentialFormSeed } from '../utils/credentialFormUtils';
import {
    buildKeyValuePairs,
    pairsToRecord,
} from '../utils/credentialFormUtils';

type CredentialFormValues =
    | CreateCredentialFormValues
    | UpdateCredentialFormValues;

type UseCredentialFormParams = {
    mode: 'create' | 'edit';
    disabled?: boolean;
    initialValues?: CredentialFormSeed;
    isLoadingInitialValues?: boolean;
};

export function useCredentialForm({
    mode,
    disabled = false,
    initialValues,
    isLoadingInitialValues = false,
}: UseCredentialFormParams) {
    const initialConfigurationPairs = buildKeyValuePairs(
        initialValues?.configuration
    );
    const [configurationPairs, setConfigurationPairs] = useState(
        initialConfigurationPairs
    );
    const [secretPairs, setSecretPairs] = useState<
        typeof initialConfigurationPairs
    >([]);

    const form = useForm<CredentialFormValues>({
        defaultValues: {
            name: initialValues?.name ?? '',
            flowId: initialValues?.flowId ?? undefined,
            configuration: initialValues?.configuration ?? {},
            secrets: {},
        },
        resolver: zodResolver(
            mode === 'edit' ? updateCredentialSchema : createCredentialSchema
        ),
        reValidateMode: 'onSubmit',
        mode: 'onSubmit',
        disabled,
    });

    useEffect(() => {
        form.setValue('configuration', pairsToRecord(configurationPairs), {
            shouldValidate: true,
        });
        form.setValue('secrets', pairsToRecord(secretPairs), {
            shouldValidate: true,
        });
    }, [configurationPairs, secretPairs, form]);

    useEffect(() => {
        if (isLoadingInitialValues) return;
        form.reset({
            name: initialValues?.name ?? '',
            flowId: initialValues?.flowId,
            configuration: initialValues?.configuration ?? {},
            secrets: {},
        });

        setConfigurationPairs(buildKeyValuePairs(initialValues?.configuration));
        setSecretPairs([]);
    }, [form, initialValues, isLoadingInitialValues]);

    function resetFormState() {
        form.reset({
            name: initialValues?.name ?? '',
            flowId: initialValues?.flowId,
            configuration: initialValues?.configuration ?? {},
            secrets: {},
        });
        setConfigurationPairs(initialConfigurationPairs);
        setSecretPairs([]);
    }

    return {
        form,
        configurationPairs,
        setConfigurationPairs,
        secretPairs,
        setSecretPairs,
        resetFormState,
    } as const;
}
