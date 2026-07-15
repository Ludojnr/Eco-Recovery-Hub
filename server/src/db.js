import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error(
    "[db] No database connection string found. Set DATABASE_URL in the environment.",
  );
}

// Neon (and most managed Postgres) require SSL. `pg` needs sslmode handling.
export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes("sslmode=disable")
    ? false
    : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected idle client error:", err.message);
});

/**
 * Creates the single table used to persist application state.
 * Each row is one workspace's full app-state JSON document.
 */
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      workspace_id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log("[db] Schema ready (app_state table).");
}

export async function getState(workspaceId) {
  const { rows } = await pool.query(
    "SELECT data, updated_at FROM app_state WHERE workspace_id = $1",
    [workspaceId],
  );
  if (rows.length === 0) return null;
  return { data: rows[0].data, updatedAt: rows[0].updated_at };
}

export async function putState(workspaceId, data) {
  const { rows } = await pool.query(
    `INSERT INTO app_state (workspace_id, data, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (workspace_id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = now()
     RETURNING updated_at`,
    [workspaceId, data],
  );
  return { updatedAt: rows[0].updated_at };
}
