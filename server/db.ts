import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Allow build process to complete even without DATABASE_URL
// This is needed for Railway deployment where DATABASE_URL is only available at runtime
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  console.warn("DATABASE_URL not found in production environment. Make sure to add a PostgreSQL service in Railway.");
}

// Create pool only if DATABASE_URL is available
export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;