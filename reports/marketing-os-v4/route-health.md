# Route health - Marketing OS v4

## Rotas esperadas

- /
- /storyops
- /campaigns
- /operations
- /exports
- /safety
- /qa

## Verificacao estatica

O script `npm run health:routes` valida:

- existencia dos arquivos das rotas;
- carregamento dos motores principais;
- geracao da semana piloto;
- execucao do dogfooding;
- execucao do QA.

## Verificacao local com servidor

Com o dev server ativo em `http://localhost:3010`, o script `npm run health:routes:local` valida:

- HTTP 200 em cada rota principal;
- texto minimo esperado na resposta HTML;
- inclusao de `/qa` no fluxo V4.

## Troubleshooting conhecido

Se a UI aparecer sem CSS depois de `npm run build`, reiniciar o dev server. O build mexe em `.next`, e o servidor de desenvolvimento pode ficar em estado visual inconsistente ate reiniciar.
