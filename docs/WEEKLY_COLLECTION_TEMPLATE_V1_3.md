# v1.3 - Template de Coleta Semanal

## Objetivo

A v1.3 adiciona um roteiro copiavel em `/data` para orientar a coleta manual de dados semanais antes da importacao assistida.

O objetivo e reduzir duvida operacional: o usuario sabe quais numeros buscar em Instagram, Meta Ads, Google Ads e funil comercial, sem precisar conectar API ou lidar com tokens nesta fase.

## O que entrou

- Painel "Template de coleta semanal" em `/data`.
- Template copiavel com campos reconhecidos pela importacao assistida.
- Botao para usar o template como rascunho da importacao.
- Checklist de seguranca contra dados pessoais.
- Modulo puro `lib/weeklyCollectionTemplate.ts`.
- Testes em `tests/weeklyCollectionTemplate.test.ts`.

## Fontes de dados sugeridas

### Meta Ads

- Investimento Meta Ads.
- Conversas Meta.
- Visitas ao perfil Meta, quando disponivel.

### Google Ads

- Investimento Google Ads.
- Cliques Google Ads.
- Conversoes Google Ads.

### Instagram organico

- Stories publicados.
- Reels publicados.
- Posts publicados.
- Visitas ao perfil Instagram.

### WhatsApp e funil comercial

- WhatsApps totais.
- Conversas qualificadas.
- Consultas marcadas.
- Consultas comparecidas.
- Cirurgias fechadas.

## O que a v1.3 nao faz

- Nao busca dados automaticamente.
- Nao usa API externa.
- Nao usa token.
- Nao cria credenciais.
- Nao altera schema Prisma.
- Nao cria migration.
- Nao salva dados so por copiar ou usar o template.
- Nao autoriza uso de dados pessoais.

## Fluxo recomendado

1. Abrir `/data`.
2. Copiar o template de coleta semanal.
3. Preencher com numeros consolidados da semana.
4. Colar na importacao assistida.
5. Clicar em "Gerar previa".
6. Revisar campos detectados.
7. Aplicar campos.
8. Salvar a semana somente depois de revisar.

## Seguranca

Use apenas metricas agregadas. Nao colar:

- nomes;
- telefones;
- DMs;
- prints;
- conversas individuais;
- dados clinicos;
- qualquer informacao que identifique pessoa.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Testes principais:

- `tests/weeklyCollectionTemplate.test.ts`
- `tests/weeklyAssistedImport.test.ts`
- `tests/weeklyDataInput.test.ts`

## Proxima evolucao

Depois do template manual, os proximos passos naturais sao:

- upload CSV/Excel;
- mapeamento manual de colunas;
- historico de importacoes;
- importacao por arquivo exportado das plataformas;
- integracoes oficiais depois que o fluxo manual estiver validado.
