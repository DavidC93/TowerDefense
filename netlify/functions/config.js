const { neon } = require('@neondatabase/serverless');

const CONFIG_ROW_ID = 'global';

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS game_configs (
      id text PRIMARY KEY,
      config jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

exports.handler = async function handler(event) {
  if (!['GET', 'POST'].includes(event.httpMethod)) return json(405, { error: 'Method not allowed' });

  const connectionString = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL;
  if (!connectionString) return json(500, { error: 'Missing database connection string in Netlify environment variables' });

  try {
    const sql = neon(connectionString);
    await ensureTable(sql);

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT config, updated_at FROM game_configs WHERE id = ${CONFIG_ROW_ID} LIMIT 1`;
      if (!rows.length) return json(200, { config: null, updatedAt: null });
      return json(200, {
        config: rows[0].config,
        updatedAt: rows[0].updated_at,
      });
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Invalid JSON body' });
    }

    if (!payload || typeof payload.config !== 'object' || Array.isArray(payload.config)) {
      return json(400, { error: 'config must be a JSON object' });
    }

    const serializedConfig = JSON.stringify(payload.config);
    const rows = await sql`
      INSERT INTO game_configs (id, config, updated_at)
      VALUES (${CONFIG_ROW_ID}, ${serializedConfig}::jsonb, now())
      ON CONFLICT (id)
      DO UPDATE SET config = EXCLUDED.config, updated_at = now()
      RETURNING updated_at
    `;

    return json(200, {
      ok: true,
      updatedAt: rows[0]?.updated_at ?? null,
    });
  } catch (error) {
    console.error('config function failed', error);
    return json(500, { error: 'Database request failed' });
  }
};
