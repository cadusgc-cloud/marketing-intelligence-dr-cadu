# v1.7 - Validacao visual da importacao CSV

## Objetivo

A v1.7 adiciona uma camada de prontidao antes de enviar a previa CSV/TSV para a importacao assistida.

Ela nao salva dados, nao conecta APIs e nao decide pelo usuario. A funcao e mostrar se a previa esta pronta, se precisa de revisao ou se deve ser bloqueada por seguranca.

## O que entrou

- Relatorio de prontidao no parser CSV.
- Painel "Validacao antes de enviar" em `/data`.
- Status: pronta, revisar ou bloqueada.
- Checklist de campos reconhecidos.
- Checklist de periodo da semana.
- Checklist de rotulo da semana.
- Checklist de midia/conteudo.
- Checklist de funil comercial.
- Bloqueio quando ha possiveis dados sensiveis.
- Bloqueio quando nenhum campo conhecido foi reconhecido.
- Testes para fluxo pronto, fluxo com revisao e fluxo bloqueado.

## Como interpretar

### Pronta

A previa tem campos reconhecidos, periodo, rotulo e metricas operacionais suficientes para seguir para a importacao assistida.

### Revisar

A previa pode ser enviada, mas algum ponto merece leitura humana, como periodo ausente, rotulo ausente, poucas metricas ou colunas ignoradas.

### Bloqueada

A previa nao deve ser enviada para a importacao assistida enquanto houver:

- possiveis dados sensiveis;
- nenhum texto importavel;
- nenhum campo conhecido reconhecido.

## Regras de seguranca

- Nao usar nomes, telefones, DMs, prontuarios, dados de paciente ou conversas individuais.
- Usar apenas metricas agregadas.
- Revisar a previa antes de aplicar nos campos da semana.
- Salvar a semana somente depois da revisao humana.
- Nao conectar APIs externas nesta versao.
- Nao usar tokens.
- Nao alterar banco.
- Nao criar migration.
- Nao rodar seed.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Teste principal:

- `tests/weeklyCsvImport.test.ts`

## Proximas melhorias

- Validacao de campos obrigatorios antes de salvar a semana.
- Diferenciar metricas essenciais por preset.
- Salvar preferencia de preset no navegador.
- Presets customizados pelo usuario.
- Historico local de importacoes revisadas.
