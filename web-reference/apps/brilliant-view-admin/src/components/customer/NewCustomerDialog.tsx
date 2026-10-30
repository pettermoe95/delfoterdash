import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    TextField,
} from '@brilliant/bds-core';
import { useToastContext } from '@bv/ui';
import type { CreateCustomerRequest } from '~/api/customers';
import { createCustomerSchema } from '~/api/customers';
import { useCreateCustomer } from '~/hooks/useCreateCustomer';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const fields = [
    { name: 'name', label: 'Name' },
    { name: 'org_no', label: 'Org no.' },
    { name: 'entra_tenant_id', label: 'Entra tenant ID' },
] as const;

export function NewCustomerDialog() {
    const [open, setOpen] = useState(false);
    const { displayToast } = useToastContext();
    const {
        register,
        handleSubmit,
        reset,
        clearErrors,
        setError,
        formState: { errors },
    } = useForm<CreateCustomerRequest>();
    const mutation = useCreateCustomer();

    const handleCreateCustomer = handleSubmit((values) => {
        if (mutation.isPending) return;
        clearErrors();
        const result = createCustomerSchema.safeParse(values);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            let shouldFocus = true;
            for (const { name } of fields) {
                const message = fieldErrors[name]?.[0];
                if (!message) continue;
                setError(name, { type: 'validate', message }, { shouldFocus });
                shouldFocus = false;
            }
            return;
        }

        mutation.mutate(result.data, {
            onSuccess: () => {
                setOpen(false);
                displayToast({
                    type: 'success',
                    text: 'Customer created successfully.',
                });
            },
            onError: (error) => {
                const status = isAxiosError(error)
                    ? error.response?.status
                    : undefined;
                displayToast({
                    type: 'error',
                    text: status
                        ? `Could not create customer (error ${status}).`
                        : 'Could not create customer. Please try again.',
                });
            },
        });
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (mutation.isPending) return;
                reset();
                mutation.reset();
                setOpen(nextOpen);
            }}
        >
            <DialogTrigger asChild>
                <Button size="sm">New customer</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={!mutation.isPending}>
                <DialogHeader>
                    <DialogTitle>New customer</DialogTitle>
                    <DialogDescription>
                        Enter the customer’s name, organization number, and
                        Entra tenant ID.
                    </DialogDescription>
                </DialogHeader>
                <form noValidate onSubmit={handleCreateCustomer}>
                    <div className="flex flex-col gap-lg">
                        {fields.map((field) => (
                            <TextField
                                key={field.name}
                                {...register(field.name)}
                                label={field.label}
                                size="sm"
                                autoComplete="off"
                                disabled={mutation.isPending}
                                error={!!errors[field.name]}
                                supportingText={errors[field.name]?.message}
                            />
                        ))}
                    </div>
                    <DialogFooter className="flex justify-end gap-3">
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            color="gray"
                            disabled={mutation.isPending}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={mutation.isPending}
                            isLoading={mutation.isPending}
                        >
                            Create customer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
