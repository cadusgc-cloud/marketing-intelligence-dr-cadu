# Marketing OS v3 - Central Operacional de Execucao Editorial

## Visao geral

A versao V3 consolida o Marketing Intelligence OS em um cockpit operacional local para executar marketing medico organico com seguranca. A central conecta o plano mensal de `/campaigns`, o StoryOps de `/storyops`, tarefas praticas, MediaOps, Safety Center, readiness e exportacoes manuais.

O objetivo e responder, todos os dias: **o que precisa ser feito agora para executar o marketing sem improviso?**

## Como rodar localmente

```bash
npm install
npm run dev
```

Por padrao o Next.js sobe em `http://localhost:3000`. Se essa porta estiver ocupada, use uma porta livre:

```bash
npm run dev -- --port 3010
```

## Rotas principais

- `/operations`: painel central Hoje / Semana / Mes.
- `/campaigns`: Maquina Editorial de 30 dias.
- `/storyops`: gerador diario de 6 stories naturais.
- `/exports`: pacotes copiaveis para execucao manual.
- `/safety`: revisao medico-publicitaria consolidada.
- `/media`: apoio de biblioteca/organizacao de midias quando usado no fluxo existente.

## Arquitetura

O dominio V3 fica em `lib/marketing-ops/`:

- `execution.ts`: monta o estado operacional completo.
- `daily.ts`: transforma um dia editorial em plano executavel.
- `weekly.ts`: agrupa planos diarios por semana.
- `tasks.ts`: cria tarefas de execucao, revisao, midia e publicacao manual.
- `backlog.ts`: cria backlog editorial e reaproveitamento de temas.
- `media.ts`: consolida MediaOps V3, lacunas e bloqueios.
- `safety.ts`: consolida riscos do mes.
- `exports.ts`: gera pacotes copiaveis.
- `scoring.ts`: calcula readiness de dia, semana e mes.
- `defaults.ts`: estado local padrao.

Tudo e deterministico, local e testavel. O mesmo input gera o mesmo resultado.

## Fluxo diario

1. Abrir `/operations`.
2. Ver o bloco **Hoje**.
3. Copiar o pacote do dia.
4. Separar midia natural sugerida.
5. Revisar safety.
6. Marcar tarefas como prontas no navegador.
7. Publicar manualmente fora do sistema, se aprovado.

Os status de tarefa ficam apenas em `localStorage` do navegador. O sistema nao envia dados para fora.

## Fluxo semanal

O painel **Esta semana** mostra:

- temas da semana;
- tarefas pendentes;
- reels a gravar;
- posts/carrosseis a preparar;
- stories diarios;
- lacunas de midia;
- checklist semanal;
- readiness semanal.

## Fluxo mensal

O painel **Este mes** mostra:

- campanha ativa;
- periodo;
- progresso de readiness;
- distribuicao operacional por dias;
- gargalos;
- riscos consolidados;
- MediaOps;
- exportacoes.

## MediaOps V3

Categorias recomendadas:

- selfie neutra;
- video curto falando para camera;
- mesa com agenda;
- cafe/livro/artigo;
- fundo simples;
- tela desfocada;
- foto de estudo;
- foto de jaleco sem ambiente identificavel;
- imagem de fim de dia;
- print de post antigo;
- bastidor generico nao identificavel;
- anotacao sem dados sensiveis;
- microvideo de reflexao;
- foto de objetos neutros de trabalho;
- capa simples para reel;
- imagem abstrata para reflexao.

Bloqueios:

- paciente visivel;
- prontuario;
- exame identificavel;
- centro cirurgico identificavel;
- localizacao revelada;
- antes/depois;
- cirurgia de hoje;
- paciente de hoje;
- hospital/clinica identificavel;
- endereco;
- documento sensivel;
- sistema judicial;
- login/senha;
- tela com dados pessoais.

## Safety Center

O Safety Center classifica conteudos como:

- `seguro`;
- `atencao`;
- `revisar_antes_de_postar`;
- `bloquear`.

Riscos avaliados:

- promessa de resultado;
- CTA agressivo;
- diagnostico;
- prescricao;
- antes/depois;
- exposicao de paciente;
- local revelado;
- bastidor inventado;
- sensacionalismo;
- comparacao depreciativa;
- afirmacao absoluta;
- urgencia artificial;
- tom de campanha;
- sugestao de procedimento individual.

## Exportacoes

A rota `/exports` gera:

1. Pacote do dia.
2. Pacote da semana.
3. Pacote do mes.
4. Stories do dia.
5. Roteiros de reels.
6. Posts/carrosseis.
7. Legendas.
8. Briefing para editor de video.
9. Checklist de midia.
10. Google Sheets TSV.
11. Google Agenda.
12. Etus/Gerenciador manual.
13. Backup JSON local.
14. Relatorio de seguranca.

Nada e enviado automaticamente. Tudo e texto copiavel.

## Etus e gerenciador de redes sociais

A exportacao `Etus / Gerenciador manual` contem:

- data sugerida;
- canal;
- formato;
- titulo interno;
- texto/legenda;
- midia necessaria;
- observacoes;
- status;
- risco.

Ela serve para copiar manualmente para a ferramenta usada pela equipe. Nao existe API, token ou postagem automatica.

## O que o sistema nao faz

- Nao conecta Instagram, Meta, TikTok, YouTube, Facebook, Google, WhatsApp, OpenAI ou Etus.
- Nao publica automaticamente.
- Nao agenda posts reais.
- Nao envia mensagens.
- Nao faz scraping.
- Nao usa paciente, prontuario, DM, nome, foto privada ou dado clinico.
- Nao altera banco.
- Nao altera schema Prisma.
- Nao cria autenticacao.
- Nao substitui revisao humana.

## Validacao

Comandos principais:

```bash
npm test
npm run test
npx tsc --noEmit
npm run smoke:marketing
npm run build
git diff --check
```

Se `npm run dev` nao subir, conferir:

- porta ocupada;
- `.next` corrompido;
- erro de import/export;
- componente client usando `window` fora de `useEffect`;
- alias `@/`;
- dependencia nao instalada;
- problema de variavel de ambiente sem imprimir valores.

## Troubleshooting se o app nao rodar

1. Rodar `npm install`.
2. Rodar `npx tsc --noEmit`.
3. Rodar `npm run build`.
4. Rodar `npm run dev -- --port 3010`.
5. Abrir `/`, `/storyops`, `/campaigns`, `/operations`, `/exports`, `/safety`.
6. Se houver erro de porta, escolher outra porta.
7. Se houver erro de cache, remover apenas `.next` quando for claramente cache local.

## Proximos passos possiveis

- Salvar status operacional em storage local exportavel/importavel.
- Criar importacao manual de CSV/TSV para media real planejada.
- Adicionar filtros mais avancados por pilar, formato e risco.
- Preparar adapters futuros para APIs oficiais, sem ativar chamadas reais.
- Criar uma rotina semanal de fechamento: dados agregados, leitura, plano mensal e fila de execucao.
