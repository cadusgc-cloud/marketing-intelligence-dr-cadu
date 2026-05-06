# AGENTS.md

## Comandos principais

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
npm run build
npm test
```

## Observações para agentes

- Não adicionar autenticação nesta versão.
- Não integrar APIs externas ou OpenAI API neste MVP.
- Não criar campos ou telas para dados pessoais de pacientes.
- Manter parser, validação e recomendação separados para facilitar futura troca por LLM assistivo.
- Dezembro/2025 deve ser tratado como anomalia operacional e excluído de benchmarks.
- UI e mensagens devem permanecer em português.
