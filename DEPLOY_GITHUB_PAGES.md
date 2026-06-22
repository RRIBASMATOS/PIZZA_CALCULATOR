# Como publicar no GitHub Pages sem erro 404

Este pacote tem duas opções de publicação.

## Opção A — Publicar pela raiz do repositório

Use esta opção se em **Settings → Pages** estiver configurado:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

Passos:

1. Extraia este ZIP.
2. Abra a pasta extraída.
3. Suba para o GitHub os arquivos da raiz: `index.html`, `styles.css`, `src/`, `public/`, `.nojekyll`, `404.html`, `README.md`.
4. Não suba apenas o ZIP fechado.
5. Não suba uma pasta contendo esses arquivos; o `index.html` precisa aparecer diretamente na tela principal do repositório.

## Opção B — Publicar pela pasta /docs

Use esta opção se em **Settings → Pages** estiver configurado:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`

Este pacote já contém uma pasta `docs/` completa com outro `index.html` dentro dela.

Passos:

1. Extraia este ZIP.
2. Suba a pasta `docs/` inteira para a raiz do repositório.
3. Em Settings → Pages, escolha `main` e `/docs`.

## Como conferir se está certo

Na raiz do repositório deve existir pelo menos um destes caminhos:

- Para root: `index.html`
- Para docs: `docs/index.html`

Se o GitHub Pages mostrar 404 dizendo que não encontrou `index.html`, o arquivo não está no local que o Pages está usando.
