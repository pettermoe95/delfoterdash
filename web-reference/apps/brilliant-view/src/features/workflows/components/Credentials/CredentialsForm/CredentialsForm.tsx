import {
    Button,
    DialogFooter,
    Icon,
    SingleSelect,
    TextField,
} from '@brilliant/bds-core';
import type {
    CreateCredentialFormValues,
    UpdateCredentialFormValues,
} from '@bv/api';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useCredentialFlowsQuery } from '../../../hooks/useCredentialFlowsQuery';
import { useCredentialForm } from '../../../hooks/useCredentialForm';
import {
    useCreateCredential,
    useUpdateCredential,
} from '../../../hooks/useCredentialMutations';
import {
    buildCredentialReAuthorizationUrl,
    getAuthorizationUrlValue,
    getClientIdValue,
    redirectToReAuthorization,
} from '../../../utils/credentialReAuthorization';

type CredentialFormValues =
    | CreateCredentialFormValues
    | UpdateCredentialFormValues;

type CredentialsFormProps = {
    mode: 'create' | 'edit';
    disabled: boolean;
    credentialId?: string;
    isLoadingInitialValues?: boolean;
    initialValues?: {
        flowId: string;
        name?: string;
        configuration?: Record<string, string>;
    };
    onSuccess?: () => void;
    onError?: () => void;
    onClose?: () => void;
};

export function CredentialsForm({
    mode,
    disabled,
    credentialId,
    isLoadingInitialValues = false,
    initialValues,
    onSuccess,
    onError,
    onClose,
}: CredentialsFormProps) {
    const localize = useLocalize();
    const { data: credentialFlows = [], isLoading: isCredentialFlowsLoading } =
        useCredentialFlowsQuery();
    const createCredentialMutation = useCreateCredential();
    const updateCredentialMutation = useUpdateCredential();
    const {
        form,
        configurationPairs,
        setConfigurationPairs,
        secretPairs,
        setSecretPairs,
        resetFormState,
    } = useCredentialForm({
        mode,
        disabled,
        initialValues,
        isLoadingInitialValues,
    });

    const createMode = mode === 'create';

    const flowOptions = credentialFlows.map((flow) => ({
        label: flow.name,
        value: flow.id,
    }));

    const selectedFlowId = useWatch({
        control: form.control,
        name: 'flowId',
    });
    const selectedFlow = credentialFlows.find(
        (flow) => flow.id === selectedFlowId
    );

    const configurationValueMap = Object.fromEntries(
        configurationPairs.map((pair) => [pair.key, pair.value])
    );
    const secretValueMap = Object.fromEntries(
        secretPairs.map((pair) => [pair.key, pair.value])
    );

    const updateConfigurationValue = (key: string, value: string) => {
        setConfigurationPairs((prev) =>
            prev.map((pair) => (pair.key === key ? { ...pair, value } : pair))
        );
    };

    const updateSecretValue = (key: string, value: string) => {
        setSecretPairs((prev) =>
            prev.map((pair) => (pair.key === key ? { ...pair, value } : pair))
        );
    };

    const submitHandler = form.handleSubmit(handleSubmit);
    const validSubmitCount = form.formState.submitCount > 0;

    useEffect(() => {
        if (!selectedFlow) return;
        const configurationValues = form.getValues('configuration') ?? {};
        const secretValues = form.getValues('secrets') ?? {};

        const nextConfigurationPairs = selectedFlow.configuration.map(
            (field) => ({
                key: field.key,
                value: configurationValues[field.key] ?? '',
            })
        );
        const nextSecretPairs = selectedFlow.secrets.map((field) => ({
            key: field.key,
            value: secretValues[field.key] ?? '',
        }));

        setConfigurationPairs(nextConfigurationPairs);
        setSecretPairs(nextSecretPairs);
    }, [selectedFlow, form, setConfigurationPairs, setSecretPairs]);

    async function handleSubmit(values: CredentialFormValues) {
        try {
            if (createMode) {
                if (!values.flowId) {
                    form.setError('flowId', {
                        type: 'manual',
                        message: localize('workflows.form.flowRequired'),
                    });
                    return;
                }

                const createdCredential =
                    await createCredentialMutation.mutateAsync({
                        configuration: values.configuration,
                        flow_id: values.flowId,
                        name: values.name,
                        secrets: values.secrets,
                    });

                const authorizationUrl = getAuthorizationUrlValue(
                    values.configuration
                );
                const clientId = getClientIdValue(values.configuration);
                const redirectUrl =
                    authorizationUrl && clientId && createdCredential.id
                        ? buildCredentialReAuthorizationUrl(
                              authorizationUrl,
                              clientId,
                              createdCredential.id
                          )
                        : null;

                if (redirectUrl) {
                    redirectToReAuthorization(redirectUrl);
                    return;
                }
            } else {
                if (!credentialId) {
                    onError?.();
                    return;
                }

                const nonEmptySecrets = Object.fromEntries(
                    Object.entries(values.secrets).filter(
                        ([, secretValue]) => secretValue.trim().length > 0
                    )
                );

                await updateCredentialMutation.mutateAsync({
                    credentialId,
                    payload: {
                        configuration: values.configuration,
                        name: values.name,
                        ...(Object.keys(nonEmptySecrets).length > 0
                            ? { secrets: nonEmptySecrets }
                            : {}),
                    },
                });
            }
            resetFormState();
            onSuccess?.();
            onClose?.();
        } catch (err) {
            onError?.();
            console.error(err);
        }
    }

    return (
        <>
            <form onSubmit={submitHandler}>
                <div className="space-y-4xl">
                    <div className="flex flex-col gap-3xl">
                        {mode === 'create' && (
                            <Controller
                                control={form.control}
                                name="flowId"
                                render={({
                                    field,
                                    fieldState: { invalid, error },
                                }) => (
                                    <SingleSelect
                                        name={field.name}
                                        label={localize(
                                            'workflows.form.credentialType'
                                        )}
                                        size="sm"
                                        options={flowOptions}
                                        value={field.value ?? ''}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                        disabled={
                                            isCredentialFlowsLoading ||
                                            disabled ||
                                            flowOptions.length === 0
                                        }
                                        placeholder={
                                            isCredentialFlowsLoading
                                                ? localize(
                                                      'workflows.form.loadingCredentialTypes'
                                                  )
                                                : localize(
                                                      'workflows.form.selectCredentialType'
                                                  )
                                        }
                                        error={invalid}
                                        supportingText={error?.message}
                                    />
                                )}
                            />
                        )}
                        <Controller
                            control={form.control}
                            name="name"
                            render={({
                                field,
                                fieldState: { invalid, error },
                            }) => (
                                <TextField
                                    label={localize('workflows.form.name')}
                                    placeholder={localize(
                                        'workflows.form.namePlaceholder'
                                    )}
                                    size="sm"
                                    error={invalid}
                                    supportingText={error?.message}
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-lg">
                        <div>
                            <p className="text-secondary bv-text-font-md-medium">
                                {localize('workflows.form.configuration')}
                            </p>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateRows:
                                    isLoadingInitialValues || selectedFlow
                                        ? '1fr'
                                        : '0fr',
                                transition: 'grid-template-rows 200ms ease',
                            }}
                        >
                            <div style={{ overflow: 'hidden' }}>
                                {isLoadingInitialValues ? (
                                    <div className="flex items-center gap-2 text-secondary">
                                        <Icon
                                            icon="bv:loading"
                                            className="animate-spin"
                                        />
                                    </div>
                                ) : selectedFlow?.configuration?.length ? (
                                    <div className="flex flex-col gap-lg">
                                        {selectedFlow.configuration.map(
                                            (field) => (
                                                <TextField
                                                    name="configuration"
                                                    key={field.key}
                                                    label={field.display_name}
                                                    placeholder={
                                                        field.display_name
                                                    }
                                                    size="sm"
                                                    autoComplete="off"
                                                    value={
                                                        configurationValueMap[
                                                            field.key
                                                        ] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        updateConfigurationValue(
                                                            field.key,
                                                            event.target.value
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                ) : selectedFlow ? (
                                    <p className="text-tertiary bv-text-font-xs-regular">
                                        {localize(
                                            'workflows.form.noConfigurationRequired'
                                        )}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        {validSubmitCount &&
                            form.formState.errors.configuration?.message && (
                                <p className="text-error-primary bv-text-font-sm-regular">
                                    {typeof form.formState.errors.configuration
                                        .message === 'string'
                                        ? form.formState.errors.configuration
                                              .message
                                        : null}
                                </p>
                            )}
                    </div>

                    <div className="flex flex-col gap-lg">
                        <div>
                            <p className="text-secondary bv-text-font-md-medium">
                                {localize('workflows.form.secrets')}
                            </p>
                            <p className="text-tertiary bv-text-font-xs-regular">
                                {localize(
                                    createMode
                                        ? 'workflows.credentialsSecretInfoCreate'
                                        : 'workflows.credentialsSecretInfoEdit'
                                )}
                            </p>
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateRows:
                                    isLoadingInitialValues || selectedFlow
                                        ? '1fr'
                                        : '0fr',
                                transition: 'grid-template-rows 200ms ease',
                            }}
                        >
                            <div style={{ overflow: 'hidden' }}>
                                {isLoadingInitialValues ? (
                                    <div className="flex items-center gap-2 text-secondary">
                                        <Icon
                                            icon="bv:loading"
                                            className="animate-spin"
                                        />
                                    </div>
                                ) : selectedFlow?.secrets?.length ? (
                                    <div className="flex flex-col gap-lg">
                                        {selectedFlow.secrets.map((field) => (
                                            <TextField
                                                name="secrets"
                                                key={field.key}
                                                label={field.display_name}
                                                placeholder={field.display_name}
                                                size="sm"
                                                autoComplete="off"
                                                value={
                                                    secretValueMap[field.key] ??
                                                    ''
                                                }
                                                onChange={(event) =>
                                                    updateSecretValue(
                                                        field.key,
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                ) : selectedFlow ? (
                                    <p className="text-tertiary bv-text-font-xs-regular">
                                        {localize(
                                            'workflows.form.noSecretsRequired'
                                        )}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        {validSubmitCount &&
                            form.formState.errors.secrets?.message && (
                                <p className="text-error-primary bv-text-font-sm-regular">
                                    {typeof form.formState.errors.secrets
                                        .message === 'string'
                                        ? form.formState.errors.secrets.message
                                        : null}
                                </p>
                            )}
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex justify-end gap-3">
                        <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                resetFormState();
                                onClose?.();
                            }}
                        >
                            {localize('miscTerms.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            type="button"
                            onClick={async () => {
                                const isValid = await form.trigger();
                                if (!isValid) return;
                                void submitHandler();
                            }}
                        >
                            {mode === 'edit'
                                ? localize('miscTerms.saveChanges')
                                : localize('workflows.addCredentials')}
                        </Button>
                    </div>
                </DialogFooter>
            </form>
        </>
    );
}
