import type { AboutMeResponse } from '@bv/api';
import { isLocalAuthBypass } from './env';

// No token or backend session is created. This profile only satisfies the local UI.
export const localAuth: AboutMeResponse | undefined =
    import.meta.env.DEV && isLocalAuthBypass
        ? {
              user: {
                  id: 0,
                  full_name: 'Delfoter Local Player',
                  first_name: 'Delfoter',
                  last_name: 'Local Player',
                  email: 'delfoter@localhost',
                  phone_number: null,
                  picture_url: null,
                  created_at: '2026-01-01T00:00:00.000Z',
              },
              organization: {
                  name: 'Local Delfoter Arcade',
                  organization_number: 'local',
              },
              permissions: [
                  {
                      id: 'local-admin-panel',
                      name: 'system_admin.admin_panel.access',
                      description: 'Local development UI access',
                  },
              ],
          }
        : undefined;
