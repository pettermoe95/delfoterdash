import { faker } from '@faker-js/faker';
import type { AboutMeResponse, Account, AccountPermission } from './account';
import type { DashboardDetails, DashboardPermissions } from './dashboard';

// Account Mocks //
const mockAccount = (override: Partial<Account> = {}): Account => ({
    id: faker.number.int({ min: 1, max: 100 }),
    full_name: faker.person.fullName(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone_number: faker.phone.number(),
    picture_url: faker.image.avatar(),
    created_at: faker.date.past().toISOString(),
    ...override,
});

const mockBaseAccount = () => ({
    id: faker.number.int({ min: 1, max: 100 }),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    picture_url: faker.image.avatar(),
});

const defaultPermissionNames = [
    'dashboards.read',
    'dashboards.edit',
    'dashboards.delete',
    'dashboards.create',
    'dashboards.global_filters.enable',
    'global_filters.available.read',
    'dashboards.graphs.filters.read',
    'dashboards.graphs.filters.create',
    'ai_assistant.graphs.create',
    'concepts.read',
    'concept_values.read',
    'templates.read',
    'connectors.read',
    'connectors.create',
    'users.read',
    'users.roles.set',
    'roles.read',
];

const buildPermission = (name: string): AccountPermission => ({
    id: faker.string.uuid(),
    name,
    description: faker.lorem.sentence(),
});

type MockAboutBeResponseParams = {
    account?: Partial<Account>;
    permissionNames?: string[];
};

export const mockAboutMeResponse = ({
    account,
    permissionNames,
}: MockAboutBeResponseParams = {}): AboutMeResponse => {
    const permissions =
        permissionNames?.map(buildPermission) ??
        faker.helpers.multiple(
            () =>
                buildPermission(
                    faker.helpers.arrayElement(defaultPermissionNames)
                ),
            {
                count: { min: 1, max: defaultPermissionNames.length },
            }
        );

    return {
        user: mockAccount(account),
        organization: {
            name: faker.company.name(),
            organization_number: faker.number.int().toString(),
            use_dummy_data: faker.datatype.boolean(),
        },
        permissions,
    };
};

export const mockAdminAccount = ({
    account,
    permissionNames = defaultPermissionNames,
}: MockAboutBeResponseParams = {}): AboutMeResponse =>
    mockAboutMeResponse({
        account,
        permissionNames,
    });

// Dashboard Mocks

export const mockDashboardData = (
    override: Partial<DashboardDetails> = {}
): DashboardDetails => ({
    id: faker.number.int({ min: 1, max: 100 }),
    name: faker.company.name(),
    color: null,
    icon: null,
    private: faker.datatype.boolean(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.past().toISOString(),
    layouts: [],
    created_by: mockBaseAccount(),
    permissions: {
        read: false,
        edit: false,
        delete: false,
    },
    layout_count: 0,
    layout_updated_at: null,
    global_filters: [],
    ...override,
});

export const mockDashboardWithPermissions = (
    permissions: Partial<DashboardPermissions>
) => {
    const dashboard = mockDashboardData();
    return {
        ...dashboard,
        permissions: {
            ...dashboard.permissions,
            ...permissions,
        },
    };
};
