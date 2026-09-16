import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ADR_DIR = path.join(ROOT, 'docs', 'adr')

const SCRIPTS = {
  'test-db': { cmd: 'node', args: ['scripts/test-db.mjs'] },
  'sonar': { cmd: 'node', args: ['scripts/sonar.js'] },
}

const server = new McpServer({
  name: 'mesa-justa-mcp',
  version: '1.0.0',
})

server.registerTool(
  'list_adrs',
  {
    title: 'Listar ADRs',
    description:
      'Lista o histórico de decisões de arquitetura (ADRs) do projeto Mesa Justa, contido em docs/adr/.',
  },
  async () => {
    let files
    try {
      files = (await readdir(ADR_DIR))
        .filter((f) => /^ADR-\d{4}\.md$/.test(f))
        .sort()
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Erro ao ler docs/adr/: ${err.message}` }],
        isError: true,
      }
    }

    const list = files.length
      ? files.join('\n')
      : 'Nenhum ADR encontrado em docs/adr/.'
    return { content: [{ type: 'text', text: list }] }
  }
)

server.registerTool(
  'read_adr',
  {
    title: 'Ler ADR',
    description:
      'Retorna o conteúdo integral de um Architecture Decision Record do projeto (ex.: ADR-0001).',
    inputSchema: {
      id: z
        .string()
        .regex(/^ADR-\d{4}$/, 'Formato esperado: ADR-0001')
        .describe('Código do ADR, ex.: ADR-0001'),
    },
  },
  async ({ id }) => {
    const filePath = path.join(ADR_DIR, `${id}.md`)
    let content
    try {
      content = await readFile(filePath, 'utf-8')
    } catch (err) {
      return {
        content: [{ type: 'text', text: `ADR ${id} não encontrado. Use list_adrs para ver os disponíveis.` }],
        isError: true,
      }
    }
    return { content: [{ type: 'text', text: content }] }
  }
)

server.registerTool(
  'run_script',
  {
    title: 'Executar script interno',
    description:
      'Executa um script interno homologado da solução Mesa Justa (whitelist): test-db (diagnóstico da conexão com o banco) ou sonar (análise estática).',
    inputSchema: {
      script: z
        .enum(['test-db', 'sonar'])
        .describe('Nome do script homologado a executar'),
    },
  },
  async ({ script }) => {
    const { cmd, args } = SCRIPTS[script]
    try {
      const { stdout, stderr } = await execFileAsync(cmd, args, {
        cwd: ROOT,
        timeout: 30_000,
        env: { ...process.env },
      })
      const text = [stdout.trim(), stderr.trim()].filter(Boolean).join('\n')
      return { content: [{ type: 'text', text: text || `Script "${script}" executado sem saída.` }] }
    } catch (err) {
      return {
        content: [
          {
            type: 'text',
            text: `Falha ao executar "${script}": ${err.stderr || err.message}`,
          },
        ],
        isError: true,
      }
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)