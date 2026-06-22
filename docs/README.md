# Pizzaiolo Pro — v7 Motor de Fermento Profissional

Aplicativo estático HTML + CSS + JavaScript puro, pronto para GitHub Pages.

## O que mudou nesta versão

- Novo motor de dosagem de fermento baseado no documento **Reavaliação e otimização da dosagem de fermento no engine de pizza**.
- O cálculo interno agora usa **IDY (fermento seco instantâneo)** como base e converte para:
  - fermento fresco: IDY × 3;
  - seco ativo: IDY × 1,25;
  - levain: farinha prefermentada e massa de levain.
- Foram incorporadas faixas por estilo:
  - Napolitana clássica AVPN;
  - Napolitana produzível;
  - Neo-napolitana;
  - Romana tonda/teglia/pala;
  - Detroit Artisan Charlie exato;
  - Detroit Artisan Pro otimizado 48–72h;
  - Detroit Traditional;
  - Americana NY/pan;
  - Brasileira fina/borda recheada.
- A fórmula de horas equivalentes foi revisada para tratar geladeira a 4–5°C como atividade fermentativa muito reduzida.
- O resultado agora mostra:
  - modelo de fermento aplicado;
  - fermento selecionado;
  - equivalente em IDY;
  - alerta quando a dose em IDY fica abaixo de 0,10 g.
- O **Cronograma operacional sugerido** agora inclui uma linha com a distribuição do tempo total informado:
  - tempo em temperatura ambiente antes da geladeira;
  - tempo em geladeira;
  - tempo fora da geladeira antes de abrir/assar.

## Publicação no GitHub Pages

Extraia o ZIP e suba o conteúdo extraído para a raiz do repositório. O arquivo `index.html` deve ficar diretamente na raiz, junto com `styles.css`, `src/`, `public/`, `.nojekyll`, `404.html` e este README.


## Atualização v8 — Guia de preparo de massa

Esta versão adiciona o módulo **Guia de preparo**, baseado no relatório analítico de preparo de massa por estilo. O novo módulo permite escolher estilo e subestilo e exibe:

- fórmula-base orientativa em percentual de padeiro;
- ponto técnico esperado da massa;
- passo a passo de mistura, sova, dobras, fermentação, boleamento, abertura e ponto de forneamento;
- erros comuns e cuidados operacionais por estilo.

O módulo foi integrado ao menu principal junto com **Calculadora profissional** e **Receitas de recheios**.

## Correção v8.1 — publicação no GitHub Pages

Este pacote foi montado para evitar erro 404: o `index.html` está na raiz e também há uma cópia completa em `docs/`, permitindo publicar tanto por `/ (root)` quanto por `/docs`. Leia `DEPLOY_GITHUB_PAGES.md`.

