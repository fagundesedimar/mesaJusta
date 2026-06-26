import pg from 'pg'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:MesaJusta2026@db.nzxhdqrbdvfpfobluyxd.supabase.co:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
})

async function setup() {
  const client = await pool.connect()
  try {
    await client.query(`CREATE USER prisma WITH PASSWORD 'MesaJusta2026'`)
    console.log('User prisma created')

    await client.query('GRANT USAGE ON SCHEMA public TO prisma')
    await client.query('GRANT CREATE ON SCHEMA public TO prisma')
    await client.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO prisma')
    await client.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO prisma')
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prisma')
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma')
    console.log('Permissions granted')

    console.log('Testing pooler connection...')
    const poolerPool = new pg.Pool({
      connectionString: 'postgresql://prisma.nzxhdqrbdvfpfobluyxd:MesaJusta2026@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require',
      ssl: { rejectUnauthorized: false }
    })
    const poolerClient = await poolerPool.connect()
    const res = await poolerClient.query('SELECT 1 AS test')
    console.log('Pooler connected!', JSON.stringify(res.rows))
    poolerClient.release()
    await poolerPool.end()
  } catch(e) {
    console.log('Error:', e.message)
  } finally {
    client.release()
    await pool.end()
  }
}

setup()
