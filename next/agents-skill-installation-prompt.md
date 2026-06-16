# Agents Skill Installation Prompt

## Objetivos

Instalar skills externas de repositórios específicos no diretório nativo padrão, garantindo compatibilidade e portabilidade entre agentes.

## Modo de Execução: 100% Autônomo

* O agente deve executar todo o fluxo (download, criação, movimentação e exclusão de arquivos/diretórios) de forma **totalmente autônoma**.
* **NÃO** pause a execução, **NÃO** solicite confirmação humana (no human-in-the-loop) e **NÃO** exiba prompts interativos.
* Adicione as flags necessárias (`-y`, `-f`, `--quiet`, etc.) a todos os comandos executados no terminal para garantir que eles não travem aguardando input do usuário.

## Portabilidade para outros agentes

* Utilize comandos de manipulação de arquivos e diretórios padrão POSIX ou as ferramentas de file system nativas do agente.
* Garanta que as permissões de leitura dos arquivos `SKILL.md` sejam preservadas para que o parser do OpenCode consiga indexá-los corretamente.
* A estrutura de diretórios deve ser agnóstica em relação ao sistema operacional base (Windows/Linux/macOS), utilizando caminhos relativos em todas as operações.

## Regras Críticas

1. Instalar todas as skills estritamente no diretório:
`.agents/skills/`
2. **NÃO** instalar ou manter skills em diretórios legados ou concorrentes, como:
`.agent/`
`.cursor/`
`.opencode/skills/` (use apenas `.agents/skills/` como fonte única de verdade)
3. Não modificar a estrutura interna dos repositórios de skills baixados.
4. Cada skill deve ser instalada como um subdiretório independente e **precisa** conter o seu arquivo original `SKILL.md` na raiz para ser reconhecida pelos runtimes do Antigravity e do OpenCode.

## Otimização de Performance (Ingestão)

Para endereços que apontam diretamente para arquivos ou subdiretórios específicos dentro de um repositório, utilize métodos de importação direta restrita (ex: `git sparse-checkout`, `gh repo download` ou requisições diretas via API).

* **Evite rigorosamente:** Clonagem completa (*full clone*) de repositórios inteiros.
* **Evite rigorosamente:** Varredura recursiva desnecessária no file system.

Objetivo: Reduzir o tempo de processamento, consumo de banda e otimizar a ingestão para o contexto do agente.

## Fontes das Skills

Instale as skills provenientes dos seguintes repositórios:

### Google Stitch

`[https://github.com/google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)`

### Antigravity Community Skills

`[https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/frontend-design](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/frontend-design)`
`[https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/backend-architect/](https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/backend-architect/)`
`[https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nestjs-expert](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nestjs-expert)`
`[https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/docker-expert](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/docker-expert)`
`[https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/github-actions-templates/](https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/github-actions-templates/)`

### Terraform Skill

`[https://github.com/hashicorp/agent-skills/tree/main/terraform/code-generation/skills/terraform-style-guide](https://github.com/hashicorp/agent-skills/tree/main/terraform/code-generation/skills/terraform-style-guide)`

### Vercel Skills

`[https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices](https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices)`
`[https://github.com/vercel-labs/next-skills/tree/main/skills/next-cache-components](https://github.com/vercel-labs/next-skills/tree/main/skills/next-cache-components)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns)`

### Prisma

`[https://github.com/prisma/skills/tree/main/prisma-database-setup](https://github.com/prisma/skills/tree/main/prisma-database-setup)`

### Supabase

`[https://github.com/supabase/agent-skills](https://github.com/supabase/agent-skills)`

### Clerk

`[https://github.com/clerk/skills/blob/main/skills/core/clerk-setup](https://github.com/clerk/skills/blob/main/skills/core/clerk-setup)`
`[https://github.com/clerk/skills/blob/main/skills/core/clerk](https://github.com/clerk/skills/blob/main/skills/core/clerk)`

## Procedimento de Instalação Autônoma

Para cada fonte listada acima, execute via script ou terminal integrado:

1. Extraia o nome da skill com base no último segmento da URL.
2. Crie um diretório isolado estritamente dentro de:
`.agents/skills/<skill-name>`
3. Importe apenas o conteúdo necessário da skill (download direto ou *sparse checkout*).
4. Garanta de forma mandatória que o `SKILL.md` e eventuais arquivos de suporte (como scripts de OpenCode compatíveis) aterrissem corretamente neste novo diretório de destino.

## Manutenção e Limpeza do Ambiente

Após a instalação bem-sucedida de todas as skills, purgue o ambiente de configurações externas através de deleção forçada (`rm -rf` ou equivalente do agente):

1. Remova diretórios de agentes que não são nativos ou estão obsoletos (nível local de workspace e global, se acessível).
2. Mantenha intacto apenas:
`.agents/`
3. Remova definitivamente quaisquer ocorrências de diretórios como `.agent/` e `.cursor/`.

## Resultado Esperado

O ambiente final deve possuir apenas um diretório central de configuração (`.agents/`), abrigando todas as skills instaladas como pastas independentes em `.agents/skills`. A estrutura deve estar higienizada e pronta para execução instantânea pelo Antigravity Agent Runtime e interoperável com o OpenCode.
