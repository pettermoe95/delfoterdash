import { PERMISSION, useAccount } from '~/features/auth';
import { useLocalize } from '~/i18n/I18nContext';
import { IntrospectionTable } from '../components/IntrospectionTable/IntrospectionTable';

export function DatabaseIntrospectionPage() {
    const localize = useLocalize();
    const { hasPermission } = useAccount();

    return (
        <div className="flex h-full w-full flex-col gap-5xl">
            {!hasPermission(PERMISSION.DATA_WAREHOUSE_INTROSPECT) ? (
                'You do not have access to this page. Reach out to an administrator if you believe this is an error.'
            ) : (
                <div className="flex flex-col gap-xl">
                    <h1 className="bv-text-font-xl-medium">
                        {localize('introspection.name')}
                    </h1>
                    <IntrospectionTable />
                </div>
            )}
        </div>
    );
}
