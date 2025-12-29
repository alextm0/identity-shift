'use client';

import { createAuthClient } from '@neondatabase/neon-js/auth/next';
import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    plugins: [
        magicLinkClient()
    ]
});
