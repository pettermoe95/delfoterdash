import { Icon } from '@brilliant/bds-core';
import { Row } from '@brilliant/components';

export function GraphError({ message }: { message?: string }) {
    return (
        <div
            className="flex h-full items-center justify-center"
            data-component-name="DashboardGraphFallback"
        >
            <Row justify="center" align="center">
                {message ? (
                    <span className="max-w-[80%] pb-4 text-center text-sm text-error-primary">
                        {message}
                    </span>
                ) : (
                    <Icon
                        icon="eos-icons:three-dots-loading"
                        style={{
                            fontSize: '3em',
                            opacity: '0.5',
                        }}
                    />
                )}
            </Row>
        </div>
    );
}
