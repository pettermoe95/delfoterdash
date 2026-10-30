// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { apiService } from '../api/service';

vi.mock('../api/service', () => ({ apiService: { getData: vi.fn() } }));

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
});

it('requires explicit opt-in and never supplies local auth in a production build', async () => {
    for (const [development, flag, expected] of [
        [true, 'false', false],
        [true, 'true', true],
        [false, 'true', false],
    ] as const) {
        vi.resetModules();
        vi.stubEnv('DEV', development);
        vi.stubEnv('VITE_LOCAL_AUTH_BYPASS', flag);
        const { localAuth } = await import('../config/localAuth');
        expect(!!localAuth).toBe(expected);
    }
});

it('gives the layout and sidebar an admin profile without any auth API requests', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_LOCAL_AUTH_BYPASS', 'true');
    const { useAuthentication } = await import('./useAuthentication');
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    function Probe() {
        const { auth } = useAuthentication();
        return (
            <span>
                {auth?.user.full_name}:{auth?.permissions?.[0].name}
            </span>
        );
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        await act(async () =>
            root.render(
                <>
                    <Probe />
                    <Probe />
                </>
            )
        );
        expect(container.querySelectorAll('span')).toHaveLength(2);
        expect(container.textContent).toContain(
            'Delfoter Local Player:system_admin.admin_panel.access'
        );
        expect(apiService.getData).not.toHaveBeenCalled();
    } finally {
        act(() => root.unmount());
    }
});
