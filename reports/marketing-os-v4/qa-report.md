# QA report - Marketing OS v4

## Escopo

O QA automatico valida a semana piloto, os pacotes de exportacao e a prontidao para PR.

## Regras executadas

- Stories: exatamente 6 por dia.
- Stories: foto/video sugerido em cada item.
- Stories: texto curto na tela.
- Stories: observacao de seguranca.
- Stories: sem promessa, antes/depois, CTA agressivo, diagnostico, prescricao, paciente, local real ou cirurgia do dia.
- Reels: gancho, roteiro curto, texto falado, texto na tela e safety.
- Posts/carrosseis: titulo, cards curtos, legenda e safety.
- Exportacoes: Google Sheets, Google Agenda, Etus/manual, pacote diario, pacote semanal e backup JSON tecnico.
- Exports comuns: sem JSON bruto visivel.
- Readiness: score entre 0 e 100.

## Status esperado

O cenario padrao deve passar sem falha bloqueante. Avisos podem existir para revisao humana, mas nao devem liberar publicacao automatica.

## Falhas bloqueantes

- Menos de 7 dias.
- Menos de 6 stories por dia.
- Termo proibido em conteudo aprovado.
- Pacote de exportacao vazio.
- Safety gate ausente.
- Readiness invalido.
- Erro de import ou build.
