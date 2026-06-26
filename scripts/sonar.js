const { execSync } = require('child_process')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

let host = process.env.SONARQUBE_HOST || 'http://localhost:9000'
const token = process.env.SONARQUBE_TOKEN
const projectKey = process.env.SONARQUBE_PROJECT_KEY || 'mesa-justa'

if (!token) {
  console.error('SONARQUBE_TOKEN não definido no .env')
  process.exit(1)
}

host = host.replace('://localhost', '://host.docker.internal')

const cwd = process.cwd()
const cmd = [
  'docker run --rm',
  `-v "${cwd}:/usr/src"`,
  '-w /usr/src',
  'sonarsource/sonar-scanner-cli',
  'sonar-scanner',
  `-Dsonar.host.url=${host}`,
  `-Dsonar.token=${token}`,
  `-Dsonar.projectKey=${projectKey}`,
].join(' ')

console.log(`Rodando SonarQube scanner para ${projectKey}...`)
execSync(cmd, { stdio: 'inherit' })
