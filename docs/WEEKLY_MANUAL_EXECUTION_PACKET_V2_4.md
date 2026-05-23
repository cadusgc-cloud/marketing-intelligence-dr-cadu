# Weekly Manual Execution Packet v2.4

## Objetivo

O Weekly Manual Execution Packet transforma o Board de Execucao Semanal em um roteiro de revisao humana. A camada existe para ajudar Dr. Cadu a sair da leitura semanal com decisoes registraveis, responsaveis sugeridos e dados agregados a coletar na semana seguinte.

Ela continua interna, deterministica e segura. Nao publica, nao envia mensagens, nao altera campanha, nao acessa redes sociais e nao grava decisoes no banco.

## O que o pacote inclui

- Brief executivo da semana.
- Foco da semana em linguagem direta.
- Gates de aprovacao antes de executar.
- Brief por responsavel sugerido.
- Plano de coleta agregada para a proxima semana.
- Roteiro de revisao em seis passos.
- Lista explicita do que o pacote nao autoriza.
- Links para continuar a revisao nos modulos internos.

## Gates de aprovacao

Os gates servem para impedir conclusoes apressadas:

- privacidade e dados agregados;
- governanca de comunicacao medica;
- bloqueio de publicacao/envio automatico;
- verba e campanhas, quando houver tarefa de midia;
- tracking e funil, quando houver lacuna de dados;
- Team Audit Mode, quando houver achado interno relevante.

## Plano de coleta

O pacote reforca a coleta da semana seguinte:

- rotulo e periodo;
- Meta Ads agregado;
- Google Ads agregado;
- Instagram organico agregado;
- funil comercial agregado;
- observacoes do que foi executado manualmente;
- checagem de anomalia operacional.

Esses dados devem permanecer agregados. Nao usar nomes, telefones, DMs, prontuarios, prints privados, fotos identificaveis ou informacao clinica sensivel.

## Rota

- `/weekly/execution/packet`
- Aceita `?week=<id>` para abrir o pacote da semana selecionada.

## Limites

- Nao cria schema Prisma.
- Nao cria migration.
- Nao salva decisao no banco.
- Nao integra API externa.
- Nao envia recomendacao para equipe.
- Nao executa publicacao automatica.
- Nao usa dezembro/2025 como benchmark normal.

## Como testar

```bash
npm test -- --run tests/weeklyManualExecutionPacket.test.ts tests/weeklyCommandCenter.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias

- Criar um modo imprimivel do pacote.
- Permitir copiar o roteiro como texto.
- Salvar decisoes humanas em um modelo proprio no futuro, se aprovado.
- Conectar decisoes aprovadas ao calendario editorial interno sem publicar automaticamente.
