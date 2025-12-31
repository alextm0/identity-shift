import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("Missing required environment variable DATABASE_URL");
}

export default {
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    connectionString: DATABASE_URL,
} satisfies Config;
