import postgres from "postgres";

// Uma conexão reaproveitada entre requisições (importante na Vercel)
const globalForDb = globalThis as unknown as { sql?: postgres.Sql; schemaReady?: Promise<void> };

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  // O Neon inclui parâmetros (sslmode, channel_binding) que o driver não aceita na URL;
  // o SSL já é configurado abaixo.
  const clean = new URL(url);
  clean.searchParams.delete("sslmode");
  clean.searchParams.delete("channel_binding");
  return postgres(clean.toString(), {
    max: 5,
    idle_timeout: 20,
    prepare: false, // compatível com o pooler do Neon
    ssl: isLocal ? false : "require",
  });
}

export function sql() {
  if (!globalForDb.sql) globalForDb.sql = createClient();
  return globalForDb.sql;
}

/** Cria as tabelas na primeira vez que o site roda. Não precisa rodar nada manualmente. */
export function ensureSchema() {
  if (!globalForDb.schemaReady) {
    globalForDb.schemaReady = (async () => {
      const db = sql();
      await db`
        CREATE TABLE IF NOT EXISTS site_pages (
          key TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          visible BOOLEAN NOT NULL DEFAULT TRUE,
          in_menu BOOLEAN NOT NULL DEFAULT TRUE,
          position INT NOT NULL DEFAULT 0
        )`;
      await db`
        INSERT INTO site_pages (key, title, visible, in_menu, position) VALUES
          ('home', 'Home', TRUE, TRUE, 1),
          ('servicos', 'O que fazemos', TRUE, TRUE, 2),
          ('consultoria', 'Consultoria', TRUE, TRUE, 3),
          ('contato', 'Contato', TRUE, TRUE, 4)
        ON CONFLICT (key) DO NOTHING`;
      await db`
        CREATE TABLE IF NOT EXISTS landing_pages (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          html TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'rascunho',
          noindex BOOLEAN NOT NULL DEFAULT TRUE,
          isolated BOOLEAN NOT NULL DEFAULT TRUE,
          notes TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await db`
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          kind TEXT NOT NULL DEFAULT 'lead',
          stage TEXT NOT NULL DEFAULT 'novo',
          name TEXT NOT NULL,
          company TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          segment TEXT NOT NULL DEFAULT '',
          source TEXT NOT NULL DEFAULT '',
          estimated_value NUMERIC(14,2) NOT NULL DEFAULT 0,
          message TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await db`
        CREATE TABLE IF NOT EXISTS contact_notes (
          id SERIAL PRIMARY KEY,
          contact_id INT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
          body TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await db`
        CREATE TABLE IF NOT EXISTS contact_links (
          id SERIAL PRIMARY KEY,
          contact_id INT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
          label TEXT NOT NULL DEFAULT '',
          url TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await db`
        CREATE TABLE IF NOT EXISTS pis (
          id SERIAL PRIMARY KEY,
          number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'rascunho',
          contact_id INT REFERENCES contacts(id) ON DELETE SET NULL,
          advertiser TEXT NOT NULL DEFAULT '',
          vehicle TEXT NOT NULL DEFAULT '',
          campaign TEXT NOT NULL DEFAULT '',
          gross NUMERIC(14,2) NOT NULL DEFAULT 0,
          net NUMERIC(14,2) NOT NULL DEFAULT 0,
          due_date DATE,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
      await db`
        CREATE TABLE IF NOT EXISTS login_attempts (
          id SERIAL PRIMARY KEY,
          ip TEXT NOT NULL,
          ok BOOLEAN NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`;
    })().catch((err) => {
      globalForDb.schemaReady = undefined;
      throw err;
    });
  }
  return globalForDb.schemaReady;
}

/** Atalho: garante as tabelas e devolve o cliente SQL. */
export async function db() {
  await ensureSchema();
  return sql();
}
