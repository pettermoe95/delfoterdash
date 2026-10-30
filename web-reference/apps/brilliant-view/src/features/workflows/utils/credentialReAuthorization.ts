const AUTHORIZATION_URL_KEY = 'authorizationUrl';
const CLIENT_ID_KEY = 'client_id';
const OAUTH_AUTHORIZATION_CODE = 'oauthauthorizationcode';
const REDIRECT_URI = '/api/v1/credentials/auth/callback';

export const normalizeFlowName = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

export function isOAuthAuthorizationCodeFlowName(flowName: string): boolean {
    return normalizeFlowName(flowName) === OAUTH_AUTHORIZATION_CODE;
}

export function getAuthorizationUrlValue(
    configuration: Record<string, string>
): string | undefined {
    return configuration[AUTHORIZATION_URL_KEY];
}

export function getClientIdValue(
    configuration: Record<string, string>
): string | undefined {
    return configuration[CLIENT_ID_KEY];
}

export function buildCredentialReAuthorizationUrl(
    authorizationUrl: string,
    clientId: string,
    credentialId: string
): string | null {
    try {
        const parsedUrl = new URL(authorizationUrl);
        parsedUrl.searchParams.set('response_type', 'code');
        parsedUrl.searchParams.set('client_id', clientId);
        parsedUrl.searchParams.set(
            'redirect_uri',
            `${window.location.origin}${REDIRECT_URI}`
        );
        parsedUrl.searchParams.set('state', credentialId);

        return parsedUrl.toString();
    } catch (error) {
        console.error('Invalid re-authorization redirect URL', error);
        return null;
    }
}

export function redirectToReAuthorization(authorizationUrl: string) {
    window.location.assign(authorizationUrl);
}
