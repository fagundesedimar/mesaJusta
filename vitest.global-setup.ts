import { spawn, type ChildProcess } from 'child_process'
import path from 'path'

let server: ChildProcess | null = null

export async function setup(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    server = spawn('npx', ['next', 'dev', '-p', '3000'], {
      cwd: path.resolve(__dirname),
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' },
      shell: true,
    })

    let resolved = false
    const timeout = setTimeout(() => {
      if (!resolved) {
        reject(new Error('Timeout waiting for Next.js dev server on port 3000'))
      }
    }, 120_000)

    const onData = (data: Buffer) => {
      const text = data.toString()
      process.stdout.write(`[next-dev] ${text}`)
      if (!resolved && (text.includes('Local:') || text.includes('localhost:3000') || text.includes('ready'))) {
        resolved = true
        clearTimeout(timeout)
        resolve()
      }
    }

    server.stdout?.on('data', onData)
    server.stderr?.on('data', onData)

    server.on('error', (err) => {
      clearTimeout(timeout)
      if (!resolved) reject(err)
    })

    server.on('exit', (code) => {
      if (!resolved) {
        clearTimeout(timeout)
        reject(new Error(`Next.js dev server exited with code ${code} before becoming ready`))
      }
    })
  })
}

export async function teardown(): Promise<void> {
  if (server) {
    server.kill('SIGTERM')
    server = null
  }
}
