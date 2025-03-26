import "dotenv/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let db: NodePgDatabase;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  db = drizzle(pool); // Use Pool instead of direct connection string
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  process.exit(1);
}

export default db;
