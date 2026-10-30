import { Button, Icon } from '@brilliant/bds-core';
import { useMutation } from '@tanstack/react-query';
import { API } from '~/api';
import { env } from '~/config/env';
import { useAccount } from '~/features/auth';

export function ImpersonationBanner() {
    const { account, impersonator } = useAccount();

    const stopMutation = useMutation({
        mutationFn: () => API.stopImpersonating(),
        onSuccess: () => {
            window.location.href = env.adminBaseUrl;
        },
    });

    if (!impersonator || !account) return null;

    return (
        <div className="flex items-center justify-between gap-md bg-warning-solid px-xl py-md text-white">
            <div className="flex items-center gap-sm">
                <Icon icon="bv:alert-circle" />
                <span className="bv-text-font-md-medium">
                    Impersonating {account.full_name} ({account.email})
                </span>
            </div>
            <Button
                size="sm"
                variant="filled"
                color="primary"
                isLoading={stopMutation.isPending}
                onClick={() => stopMutation.mutate()}
            >
                Stop impersonating
            </Button>
        </div>
    );
}
