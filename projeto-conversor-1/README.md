# Projeto Conversor

Este projeto é uma aplicação que permite a conversão de imagens, vídeos e documentos de forma robusta e eficiente, utilizando um servidor Node.js com Express.js.

## Estrutura do Projeto

- **src/**: Contém o código-fonte da aplicação.
  - **controllers/**: Controladores que gerenciam as requisições e a lógica de conversão.
    - `DocumentoController.ts`: Controlador para conversão de documentos.
    - `ImagemController.ts`: Controlador para conversão de imagens.
    - `VideoController.ts`: Controlador para conversão de vídeos.
  - **routes/**: Define as rotas da API.
    - `api.ts`: Configuração das rotas da API.
  - **services/**: Contém a lógica de negócios para cada tipo de conversão.
    - `DocumentoService.ts`: Serviço para conversão de documentos.
    - `ImagemService.ts`: Serviço para conversão de imagens.
    - `VideoService.ts`: Serviço para conversão de vídeos.
  - **utils/**: Funções utilitárias para operações de conversão.
    - `conversao.ts`: Funções auxiliares para conversão.
  - `app.ts`: Ponto de entrada da aplicação.

- **public/**: Contém os arquivos estáticos da interface do usuário.
  - **css/**: Estilos CSS.
    - `style.css`: Estilos para a interface do usuário.
  - **js/**: Código JavaScript do lado do cliente.
    - `main.js`: Lógica do lado do cliente.
  - `index.html`: Página HTML principal.

## Dependências

Este projeto utiliza as seguintes dependências:

- `express`: Framework para construir aplicações web.
- `sharp`: Biblioteca para manipulação de imagens.
- `fluent-ffmpeg`: Interface para a ferramenta ffmpeg, utilizada para conversão de vídeos.
- `libreoffice-convert`: Biblioteca para conversão de documentos utilizando LibreOffice.

## Como Executar

1. Clone o repositório.
2. Instale as dependências com `npm install`.
3. Inicie o servidor com `npm start`.
4. Acesse a aplicação em `http://localhost:3000`.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.