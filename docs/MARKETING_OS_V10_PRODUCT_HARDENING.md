# Marketing OS v10 - Product Hardening, UX QA e Release Polish

## Visao geral

A V10 endurece o Marketing Intelligence OS como produto local. A fase nao cria integracao externa nem backend real; ela melhora a experiencia de uso, cria um manifesto de rotas, adiciona componentes compartilhados, fortalece estados de erro/vazio, inclui checagens de acessibilidade e conteudo de UI, e deixa a tela de release mais clara para PR manual.

## O que foi endurecido

- Product Shell com componentes reutilizaveis em `components/product`.
- Tokens e labels de UI em `lib/product-ui` e `lib/product-copy`.
- Manifesto de rotas em `lib/product-routes`.
- Home simplificada apontando para `/command-center`.
- Navegacao global agrupada por rotina.
- Error boundary e not-found amigaveis.
- Command Center com top 3 acoes e mapa de rotas.
- Onboarding com fluxo semanal, mensal, backup, PR e glossario.
- Release Candidate com score V10 e readiness por area.
- Documentation Hub em `/documentation`.

## Product Shell

Componentes principais:

- `PageHeader`
- `SectionHeader`
- `MetricCard`
- `StatusBadge`
- `RiskBadge`
- `ReadinessBadge`
- `EmptyState`
- `ErrorState`
- `CopyBlock`
- `ExportPanel`
- `ChecklistPanel`
- `ProgressBar`
- `RouteLinkCard`
- `CommandActionCard`
- `LocalOnlyNotice`
- `SafetyNotice`

Eles reduzem a aparencia de paginas soltas e criam um padrao operacional discreto.

## Route Manifest

O manifesto em `lib/product-routes` lista rotas, grupo, maturidade, textos esperados, scripts relacionados, docs e notas de seguranca. Ele alimenta:

- navegacao global;
- route health;
- Command Center;
- Documentation Hub;
- release polish;
- QA visual.

Nenhuma rota do manifesto usa API externa.

## Navegacao global

Grupos:

- Comece aqui
- Producao
- Planejamento
- Metricas
- Seguranca e QA
- Workspace

O objetivo e evitar que o usuario precise lembrar 30 rotas.

## Home

A home virou uma porta de entrada simples:

1. abrir Command Center;
2. fechar semana;
3. produzir no Studio;
4. revisar;
5. exportar manualmente.

## Estados vazios

Estados vazios foram padronizados para apontar:

- o que falta;
- por que importa;
- proxima rota;
- exemplo local quando existe.

## Estados de erro

Foram adicionados:

- `app/error.tsx`;
- `app/not-found.tsx`.

As mensagens nao exibem stack sensivel e apontam para `/command-center`.

## Acessibilidade

O script `npm run ui:a11y` faz checagem estatica leve:

- paginas principais com `h1`;
- botoes com texto;
- inputs com label ou aria;
- imagens com `alt`;
- links nao genericos.

Limite: nao substitui auditoria manual profunda nem ferramentas dedicadas de browser.

## Responsividade

Melhorias:

- grids responsivos;
- `min-width: 0` global para evitar estouro de cards;
- foco visivel;
- blocos copiaveis com overflow;
- navegacao agrupada em cards.

## UI Content QA

O script `npm run ui:content` procura termos sensiveis em contexto indevido:

- promessa;
- antes/depois;
- chamada agressiva;
- senha/token/cookie fora de aviso de seguranca;
- prontuario ou paciente em contexto inadequado.

Listas de bloqueio, testes e docs de seguranca sao allowlist.

## Visual QA

O script `npm run visual:check` valida:

- manifesto de rotas;
- arquivos de rotas;
- textos esperados;
- ausencia de erros criticos em HTML quando base URL e passada.

Ele nao exige screenshot; a verificacao visual final ainda usa navegador.

## Release polish

`lib/release-polish` calcula:

- release score;
- product readiness;
- UX readiness;
- route readiness;
- QA readiness;
- docs readiness;
- safety readiness;
- local-only compliance.

## Documentation Hub

`/documentation` lista:

- docs V4-V10;
- pastas de relatorios;
- scripts de validacao;
- troubleshooting;
- link para `/release` e `/onboarding`.

## Scripts novos

```bash
npm run ui:a11y
npm run ui:content
npm run visual:check
npm run product:check
```

## Relatorios

Pasta:

```text
reports/marketing-os-v10/
```

Relatorios principais:

- `product-hardening-summary.md`
- `ux-audit-report.md`
- `accessibility-report.md`
- `ui-content-safety-report.md`
- `route-manifest-report.md`
- `visual-qa-report.md`
- `release-polish-report.md`
- `navigation-report.md`
- `documentation-hub-report.md`
- `pr-readiness-v10.md`

## Troubleshooting

Se o dev server travar ou o CSS sumir:

1. parar o processo antigo na porta 3010;
2. limpar apenas `.next`, se necessario;
3. reiniciar `npm run dev -- --port 3010`;
4. rodar `npm run health:routes:local`.

## Limitacoes

- QA de acessibilidade e estatica, nao substitui auditoria completa.
- Visual QA sem screenshot nao detecta todos os problemas de layout.
- Rotas legadas foram mantidas para nao quebrar historico.
- Nao ha backend real, publicacao automatica ou integracao externa.

## Proximos passos

- Rodar todos os scripts finais.
- Validar visualmente rotas principais.
- Abrir PR manualmente a partir da branch V10.
