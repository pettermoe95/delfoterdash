import {
    Button,
    ComboBox,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    TextField,
} from '@brilliant/bds-core';
import type { Dashboard, DashboardShares } from '@bv/api';
import { useToastContext } from '@bv/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDashboardShares } from '~/features/dashboards/hooks/useDashboardShares';
import { compareUsersByName } from '~/features/users/components/UsersTable/userNameSortingFn';
import { useGroupsList } from '~/features/users/hooks/useGroups';
import { useUsersList } from '~/features/users/hooks/useUserList';
import { useLocalize } from '~/i18n/I18nContext';
import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    getDashboardShareGroupIds,
    getDashboardShareUserIds,
    PUBLIC_GROUP_ID,
} from '../../dashboardSharing';
import { useDashboardEditPermission } from '../../hooks/useDashboardEditPermission';
import { useUpdateDashboardSharing } from '../../mutations';

const editAndShareDashboardSchema = z.object({
    name: z.string().optional(),
    groupIds: z.array(z.string()),
    userIds: z.array(z.string()),
});

type ShareDashboardValues = z.infer<typeof editAndShareDashboardSchema>;

type EditAndShareDashboardDialogProps = {
    open: boolean;
    dashboard: Dashboard;
    onClose: () => void;
};

function getDefaultValues(
    dashboard: Dashboard,
    shares?: DashboardShares
): ShareDashboardValues {
    return {
        name: dashboard.name,
        groupIds: getDashboardShareGroupIds(shares).map(String),
        userIds: getDashboardShareUserIds(shares).map(String),
    };
}

export function EditAndShareDashboardDialog(
    props: EditAndShareDashboardDialogProps
) {
    const localize = useLocalize();
    const { open, onClose, dashboard } = props;
    const { canEditDashboard } = useDashboardEditPermission(dashboard);
    const { displayToast } = useToastContext();
    const { data: dashboardShares, isLoading: isDashboardSharesLoading } =
        useDashboardShares(dashboard.id, open);
    const { data: groupsResponse } = useGroupsList(open);
    const { data: usersResponse } = useUsersList(open);

    const defaultValues = useMemo(
        () => getDefaultValues(dashboard, dashboardShares),
        [dashboard, dashboardShares]
    );

    const form = useForm<ShareDashboardValues>({
        defaultValues,
        resolver: zodResolver(editAndShareDashboardSchema),
        reValidateMode: 'onChange',
        mode: 'all',
        disabled: !canEditDashboard,
    });

    const isEdited = form.formState.isDirty;
    const isValid = form.formState.isValid;
    const wasOpenRef = useRef(open);
    const updateMutation = useUpdateDashboardSharing(dashboard);
    const currentSharedGroupIds = getDashboardShareGroupIds(dashboardShares);
    const currentSharedUserIds = getDashboardShareUserIds(dashboardShares);

    const availableGroups = useMemo(
        () =>
            (groupsResponse?.groups ?? [])
                .filter((group) => group.id !== PUBLIC_GROUP_ID)
                .map((group) => ({
                    value: String(group.id),
                    label: group.name,
                })),
        [groupsResponse?.groups]
    );

    const availableUsers = useMemo(
        () =>
            [...(usersResponse ?? [])].sort(compareUsersByName).map((user) => ({
                value: String(user.id),
                label:
                    `${user.first_name} ${user.last_name}`.trim() || user.email,
            })),
        [usersResponse]
    );

    useEffect(() => {
        const justOpened = open && !wasOpenRef.current;

        wasOpenRef.current = open;

        if (!open || (!justOpened && isEdited)) return;

        form.reset(defaultValues);
    }, [defaultValues, form, isEdited, open]);

    function handleDialogOpenChange(nextOpen: boolean) {
        if (nextOpen) return;

        handleDiscardChanges();
    }

    async function handleSaveChanges(changes: ShareDashboardValues) {
        try {
            await updateMutation.mutateAsync({
                name: changes.name,
                private: !changes.groupIds
                    .map(Number)
                    .includes(PUBLIC_GROUP_ID),
                sharedGroupIds: changes.groupIds.map(Number),
                currentSharedGroupIds,
                sharedUserIds: changes.userIds.map(Number),
                currentSharedUserIds,
            });
            handleDiscardChanges();
        } catch (err) {
            displayToast({
                type: 'error',
                text: localize('dashboards.loading.updateFailed'),
            });
            console.error(err);
        }
    }

    function handleDiscardChanges() {
        form.reset(defaultValues);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="left-1/2 top-1/2 flex h-[550px] w-[calc(90vw-32px)] max-w-[600px] flex-col overflow-visible sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>
                        {localize('dashboards.editAndShare.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {localize('dashboards.editAndShare.description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSaveChanges)}>
                    <div className="space-y-4xl">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-3xl">
                            <div className="mb-2 flex-1">
                                <Controller
                                    control={form.control}
                                    name="name"
                                    render={({
                                        field,
                                        fieldState: { invalid, error },
                                    }) => (
                                        <TextField
                                            label={localize('dashboards.name')}
                                            placeholder="Name of dashboard"
                                            size="sm"
                                            error={invalid}
                                            supportingText={error?.message}
                                            autoComplete="off"
                                            {...field}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        <div className="z-99 space-y-1.5">
                            <h2 className="text-secondary bv-display-font-xs-regular">
                                {localize('dashboards.editAndShare.shareTitle')}
                            </h2>
                            <Controller
                                control={form.control}
                                name="groupIds"
                                render={({ field }) => (
                                    <ComboBox
                                        label={localize(
                                            'dashboards.editAndShare.shareWithGroups'
                                        )}
                                        placeholder={localize(
                                            'dashboards.editAndShare.nonePrivateHint'
                                        )}
                                        options={availableGroups}
                                        value={field.value}
                                        onChange={field.onChange}
                                        multiple
                                        expand
                                        portalled={false}
                                        localizeFn={localize}
                                        disabled={
                                            form.formState.disabled ||
                                            isDashboardSharesLoading
                                        }
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Controller
                                control={form.control}
                                name="userIds"
                                render={({ field }) => (
                                    <ComboBox
                                        label={localize(
                                            'dashboards.editAndShare.shareWithUsers'
                                        )}
                                        placeholder={localize(
                                            'dashboards.editAndShare.noneUserHint'
                                        )}
                                        options={availableUsers}
                                        value={field.value}
                                        onChange={field.onChange}
                                        multiple
                                        expand
                                        portalled={false}
                                        avoidCollisions={false}
                                        localizeFn={localize}
                                        disabled={
                                            form.formState.disabled ||
                                            isDashboardSharesLoading
                                        }
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-5xl">
                        <div className="flex justify-end gap-3">
                            <Button
                                size="sm"
                                type="button"
                                leftIcon="bv:close"
                                onClick={() => handleDialogOpenChange(false)}
                            >
                                {localize('miscTerms.close')}
                            </Button>
                            {canEditDashboard && (
                                <Button
                                    size="sm"
                                    disabled={
                                        !isEdited ||
                                        !isValid ||
                                        updateMutation.isPending
                                    }
                                    type="submit"
                                >
                                    {localize('miscTerms.saveChanges')}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
