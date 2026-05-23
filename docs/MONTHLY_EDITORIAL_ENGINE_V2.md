# Marketing Intelligence OS v2.0 - Maquina Editorial de 30 dias

## Objetivo

A Maquina Editorial de 30 dias transforma o Marketing Intelligence OS em uma central interna para planejar campanhas organicas mensais do Dr. Cadu Gazzinelli.

O modulo ajuda a organizar temas, pilares editoriais, stories, reels, posts, carrosseis, sugestoes de midia natural, revisao medico-publicitaria e exportacoes copiaveis.

## Como acessar

A rota principal e:

```text
/campaigns
```

Ela tambem aparece no menu principal como `Campanhas`.

## Como usar

1. Abrir `/campaigns`.
2. Revisar nome da campanha, data inicial, duracao, objetivo, publico, tom e intensidade.
3. Selecionar pilares prioritarios.
4. Clicar em `Gerar plano editorial`.
5. Revisar a visao mensal.
6. Clicar em um dia para abrir o pacote diario.
7. Copiar plano mensal, semana, dia, Google Sheets, Google Agenda ou briefing para editor.
8. Fazer revisao humana antes de qualquer publicacao manual.

## Arquitetura

O modulo foi implementado como dominio puro em:

```text
lib/monthly-editorial/
```

Arquivos principais:

- `types.ts`: tipos da campanha, dias, semanas, safety gate, MediaOps e exportacoes.
- `pillars.ts`: pilares editoriais locais do Dr. Cadu.
- `themes.ts`: biblioteca de temas mensais.
- `safety.ts`: gate medico-publicitario deterministico.
- `media.ts`: MediaOps e checklist de imagens naturais.
- `reels.ts`: gerador deterministico de reels.
- `posts.ts`: gerador deterministico de posts e carrosseis.
- `export.ts`: exportacoes em Markdown, texto, TSV e Google Agenda.
- `engine.ts`: orquestrador `generateMonthlyEditorialPlan`.
- `index.ts`: exportacao publica do modulo.

UI:

- `app/campaigns/page.tsx`
- `app/campaigns/CampaignsClient.tsx`

Testes:

- `tests/monthlyEditorial.test.ts`

## Integracao com StoryOps

Cada dia usa o `buildStoryOpsSequence` de `lib/storyops`.

Isso preserva:

- 6 stories por dia;
- formato copiavel do StoryOps;
- linguagem curta e natural;
- sugestoes de midia com cara de Instagram nativo;
- gate editorial ja existente para stories;
- revisao humana antes de publicar.

## Regras de seguranca

O safety gate avalia:

- promessa de resultado;
- CTA agressivo;
- diagnostico;
- prescricao;
- antes/depois;
- exposicao de paciente;
- local revelado;
- bastidor inventado;
- linguagem sensacionalista;
- comparacao depreciativa;
- afirmacao absoluta;
- urgencia artificial;
- termo proibido;
- frase comercial exagerada;
- sugestao de procedimento individual.

Classificacoes:

- `seguro`
- `atencao`
- `revisar_antes_de_postar`
- `bloquear`

## MediaOps

O modulo sugere midias naturais como:

- selfie neutra;
- video curto falando para camera;
- mesa com agenda/cafe;
- livro/artigo;
- fundo simples;
- tela desfocada;
- foto de estudo;
- jaleco sem ambiente identificavel;
- imagem de fim de dia;
- print de post antigo;
- bastidor generico nao identificavel;
- anotacao sem dados sensiveis;
- microvideo de reflexao.

Itens que devem bloquear ou exigir revisao:

- paciente visivel;
- prontuario;
- exame identificavel;
- centro cirurgico identificavel;
- localizacao revelada;
- antes/depois;
- cirurgia de hoje;
- paciente de hoje;
- hospital/clinica identificavel;
- placa, endereco ou dado pessoal;
- login, sistema ou documento sensivel.

## Exportacoes disponiveis

O plano gera:

- plano mensal em Markdown;
- semana atual em texto copiavel;
- dia especifico em texto copiavel;
- stories do dia;
- roteiros de reels;
- posts/carrosseis;
- checklist de midia;
- briefing para editor de video;
- tabela TSV compativel com Google Sheets;
- texto para colar manualmente no Google Agenda.

## O que nao faz

Este modulo nao:

- conecta Instagram, Meta, TikTok, YouTube, Facebook ou Google;
- publica automaticamente;
- agenda publicacao real;
- usa API externa;
- usa OpenAI API;
- faz scraping;
- faz upload real de midia;
- usa dados de pacientes;
- altera banco;
- altera schema Prisma;
- roda seed ou migracao.

## Dezembro/2025

Dezembro/2025 permanece tratado como anomalia operacional causada por hackeamento.

Se a campanha cruzar esse periodo, o safety gate consolidado registra alerta de governanca. O periodo nao deve ser usado como benchmark, media, projecao ou recomendacao normal.

## Exemplos de uso

Campanha padrao:

```text
Nome: Cirurgia plastica sem promessa
Objetivo: Fortalecer autoridade, naturalidade e expectativa realista
Publico: Pacientes que estao pensando em cirurgia plastica e precisam de informacao clara antes de decidir
Tom: humano, cientifico simples, anti-marketing elegante
Intensidade: padrao
```

## Como testar

```bash
npm test -- tests/monthlyEditorial.test.ts
npx tsc --noEmit
npm test
npm run build
git diff --check
```

## Proximos passos

- Permitir salvar campanhas locais sem banco externo.
- Conectar resultados reais agregados do `/weekly` ao planejamento mensal.
- Criar modo de revisao por responsavel interno.
- Adicionar comparacao entre campanhas planejadas e executadas.
- Preparar adapters futuros para integracoes oficiais, mantendo secrets fora do repositorio.
