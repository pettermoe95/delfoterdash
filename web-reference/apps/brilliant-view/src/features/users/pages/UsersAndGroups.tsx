import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bv/ui';
import { PERMISSION, useAccount } from '~/features/auth';
import { UsersTable } from '~/features/users/components/UsersTable/UsersTable.tsx';
import { useLocalize } from '~/i18n/I18nContext';
import { useNavigate } from 'react-router-dom';
import { GroupManagement } from '../components/GroupManagement/GroupManagement';
import { USER_ROUTES } from '../routes';

type UsersTab = 'users' | 'groups';

export function UsersAndGroups({
    initialTab,
}: {
    initialTab?: UsersTab;
} = {}) {
    const navigate = useNavigate();
    const { hasPermission } = useAccount();
    const localize = useLocalize();

    const canReadUsers = hasPermission(PERMISSION.USERS_READ);
    const canManageGroups = hasPermission(PERMISSION.GROUPS_WRITE);

    return (
        <>
            {!canReadUsers && !canManageGroups ? (
                localize('users.noAccess')
            ) : (
                <Tabs
                    value={initialTab ?? 'users'}
                    className="flex h-full min-h-0 flex-col gap-lg"
                >
                    <TabsList>
                        {canReadUsers && (
                            <TabsTrigger
                                value="users"
                                onClick={() => {
                                    navigate(USER_ROUTES.users);
                                }}
                            >
                                {localize('users.users')}
                            </TabsTrigger>
                        )}
                        {canManageGroups && (
                            <TabsTrigger
                                value="groups"
                                onClick={() => {
                                    navigate(USER_ROUTES.userGroups);
                                }}
                            >
                                {localize('users.groups')}
                            </TabsTrigger>
                        )}
                    </TabsList>
                    <TabsContent value="users">
                        <UsersTable />
                    </TabsContent>
                    <TabsContent value="groups">
                        <GroupManagement />
                    </TabsContent>
                </Tabs>
            )}
        </>
    );
}
