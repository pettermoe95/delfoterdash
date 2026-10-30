import { Icon } from '@brilliant/bds-core';

type DashboardLoadErrorProps = {
    title: string;
    description: string;
};

export function DashboardLoadError({
    title,
    description,
}: DashboardLoadErrorProps) {
    return (
        <div className="flex h-full w-full items-center justify-center px-2xl py-4xl lg:px-4xl">
            <div className="w-full max-w-2xl rounded-xl border border-secondary p-2xl text-center shadow-sm">
                <div className="flex justify-center">
                    <Icon
                        icon="bv:cloud-close"
                        className="h-12 w-12 text-fg-error-primary"
                    />
                </div>
                <div className="mt-lg space-y-sm">
                    <h1 className="text-primary bv-text-font-xl-medium">
                        {title}
                    </h1>
                    <p className="text-secondary bv-text-font-md-regular">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
