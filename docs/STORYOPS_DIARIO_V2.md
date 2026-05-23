# StoryOps Diario v2.0

## Objetivo

O StoryOps Diario v2.0 e um modulo interno para planejar, revisar e exportar sequencias de Stories do Instagram com aparencia natural, linguagem humana e seguranca medica.

Ele apoia a rotina do Dr. Cadu Gazzinelli sem transformar stories em arte publicitaria montada. A proposta e gerar uma sequencia curta de 6 stories com cara de Instagram nativo, pronta para revisao humana e execucao manual.

## Como usar

1. Abrir `/storyops`.
2. Escolher a data.
3. Escolher ou escrever o tema do dia.
4. Selecionar a linha editorial.
5. Informar contexto neutro apenas se existir.
6. Gerar a sequencia.
7. Revisar alertas editoriais e medicos.
8. Copiar a exportacao final.
9. Publicar manualmente fora do sistema, somente apos revisao humana.

## Linhas editoriais iniciais

- Bastidor leve.
- Educacao medica simples.
- Estetica natural.
- Expectativa realista.
- Rotina profissional neutra.
- Reflexao de fim de dia.
- Prova, estudo e ciencia.
- Plastica em Evidencia.
- Clareza tecnica medica.

O modulo nao usa identidade de outros projetos. A linha de clareza tecnica e generica e serve apenas para comunicacao medica responsavel.

## Regras de seguranca

O sistema alerta ou bloqueia:

- promessa de resultado;
- diagnostico ou prescricao;
- antes/depois;
- CTA agressivo;
- linguagem publicitaria demais;
- bastidor especifico sem contexto;
- local, agenda, tela, prontuario ou dado sensivel;
- paciente ou caso real;
- texto longo demais para story.

## Estrutura de exportacao

A exportacao segue o formato operacional:

```text
Story 1:
- foto/vídeo sugerido:
- texto curto na tela:
- observação de segurança:
```

O formato se repete ate o Story 6. O usuario comum nao precisa ler JSON nem dados tecnicos.

## O que o modulo faz

- Gera exatamente 6 stories.
- Sugere foto/video natural para cada story.
- Cria texto curto com cara de sticker nativo.
- Mantem tom humano, espontaneo e editavel.
- Mostra painel de riscos.
- Calcula status simples: seguro, atencao, revisar ou bloquear.
- Exporta texto copiavel.
- Reforca revisao humana antes de publicar.

## O que o modulo nao faz

- Nao conecta Instagram.
- Nao conecta Meta.
- Nao conecta WhatsApp.
- Nao chama API externa.
- Nao publica automaticamente.
- Nao agenda postagem real.
- Nao usa dados reais de pacientes.
- Nao le imagens reais.
- Nao faz OCR.
- Nao analisa arquivo privado.
- Nao substitui revisao medica, etica ou humana.

## Temas iniciais

O modulo inclui temas como:

- expectativa realista em cirurgia plastica;
- resultado natural;
- planejamento antes da cirurgia;
- importancia da consulta;
- limites da cirurgia plastica;
- cicatrizacao;
- recuperacao;
- assimetrias naturais;
- seguranca em cirurgia plastica;
- nao decidir por impulso;
- autoestima sem promessa;
- estudo e atualizacao medica;
- bastidor neutro de domingo;
- organizacao da semana;
- reflexao de fim de dia;
- Plastica em Evidencia;
- prova de titulo e estudo em cirurgia plastica;
- pericia medica e clareza tecnica.

## Proximos passos possiveis

- Conectar StoryOps ao calendario editorial semanal.
- Permitir salvar rascunhos locais no navegador.
- Integrar com a biblioteca real de imagens apos revisao de privacidade.
- Criar checklist de captura de banco de imagens.
- Exportar pacote diario em Markdown.
- Registrar resultados agregados dos stories publicados manualmente.

## Decisao de governanca

StoryOps Diario v2.0 e um modulo interno, deterministico e local. Ele nao cria integracao real com redes sociais, nao automatiza publicacao, nao usa dados reais de pacientes, nao promete resultado e nao substitui revisao humana.
