
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        NEON_AUTH_BASE_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    },
    client: {
        NEXT_PUBLIC_NEON_AUTH_BASE_URL: z.string().url(),
        NEXT_PUBLIC_NEON_AUTH_URL: z.string().url(),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_NEON_AUTH_BASE_URL: process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL,
        NEXT_PUBLIC_NEON_AUTH_URL: process.env.NEXT_PUBLIC_NEON_AUTH_URL,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
