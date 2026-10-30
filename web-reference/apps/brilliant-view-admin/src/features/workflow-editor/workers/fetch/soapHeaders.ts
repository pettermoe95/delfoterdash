import { isRecord } from '../../forms/schema';

function contentType(config: Record<string, unknown>): string {
    if (config.soapVersion !== '1.2') return 'text/xml; charset=utf-8';
    const type = 'application/soap+xml; charset=utf-8';
    // SOAP 1.2 carries the action in Content-Type rather than a SOAPAction header.
    const action = config.soapAction;
    return typeof action === 'string'
        ? `${type}; action=${JSON.stringify(action)}`
        : type;
}

export function syncSoapHeaders(
    config: Record<string, unknown>,
    previous?: Record<string, unknown>
): Record<string, unknown> {
    const headers = isRecord(config.headers) ? config.headers : {};
    const currentTypes = Object.entries(headers).filter(
        ([name]) => name.toLowerCase() === 'content-type'
    );
    const versionChanged =
        !previous ||
        (previous.soapVersion ?? '1.1') !== (config.soapVersion ?? '1.1');
    const generatedActionChanged =
        previous &&
        config.soapVersion === '1.2' &&
        previous.soapAction !== config.soapAction &&
        currentTypes.length === 1 &&
        currentTypes[0][1] === contentType(previous);
    if (!versionChanged && !generatedActionChanged) return config;
    return {
        ...config,
        headers: {
            ...Object.fromEntries(
                Object.entries(headers).filter(
                    ([name]) => name.toLowerCase() !== 'content-type'
                )
            ),
            'Content-Type': contentType(config),
        },
    };
}
