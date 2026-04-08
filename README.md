# Otimização de Aplicações com Cache Redis 🚀

Este repositório contém a atividade prática simulando um gargalo no banco de dados e demonstrando métricas e a aplicação real do **Redis** como camada de otimização de Cache.

## 🎯 Objetivo da Atividade
Demonstrar, de forma quantitativa e visual, a diferença do **Tempo de Resposta** de uma API que consulta imagens grandes (como BLOBs convertidos para Base64) utilizando um banco de dados relacional clássico versus a mesma chamada sendo interceptada e devolvida pelo banco de dados em memória **Redis**.

## 🛠️ Tecnologias Utilizadas
- **Node.js** (Ambiente de execução)
- **Express.js** (Criação de rotas da API e consumo de arquivos estáticos rápidos)
- **Redis & redis (npm)** (Configuração de conexão e gravação do formato *key-value*)
- **Vanilla HTML/CSS/JS** (Dashboard visual no frontend para testar e validar o desempenho)
- **Dotenv** (Segurança e injeção de parâmetros ambientais)

---

## ⚙️ Pré-requisitos & Instalação

1. Clone ou baixe esse repositório para sua máquina.
2. Certifique-se de ter o [Node.js](https://nodejs.org/en/) instalado.
3. Instale as bibliotecas e dependências da aplicação abrindo um terminal e rodando:
   ```bash
   npm install
   ```
4. **Configuração de Segurança (.env):**
   Para impedir o vazamento das suas credenciais num ambiente público, crie um arquivo chamado `.env` na raiz do seu projeto e preencha-o com a String de URL de conexão do seu Redis fornecida pela Host (ex: *Redis Cloud*).

   *Exemplo do arquivo `.env`:*
   ```env
   REDIS_URL='redis://default:SUA_SENHA_AQUI@endpoint.cloud.redislabs.com:PORTA'
   ```

---

## 🚀 Como Rodar o Projeto

1. Inicie o servidor, o que conectará a aplicação com sua instância Redis hospedada em nuvem. No terminal da base principal execute o comando:
   ```bash
   node src/server.js
   ```
2. Após visualizar as mensagens `Servidor rodando` e `Redis Conectado ao Cloud!` no console, abra o seu seu navegador e acesse a interface web em:
   
   👉 [http://localhost:3000](http://localhost:3000)

---

## 📊 Como Demonstrar (Guia do Aluno)

A interface no frontend simula perfeitamente o cenário da atividade. Para evidenciar aos seus professores/colegas, siga os passos abaixo:

1. Acesse o **Dashboard de Otimização**. No campo numérico digite um "ID da imagem" (por exemplo, `5`).
2. Clique no botão vermelho de "**Carregar Imagem do Servidor**".
3. **Primeiro Cenário (Sem Cache):**
   - A Aplicação vai demorar propositalmente e mostrar um tempo longo no cartão métrico (cerca de **2000 a 2500ms**).
   - Origem: **DATABASE LENTO** (em amarelo).
   - *Por que?* Estamos batendo na rota do Express onde ainda não existia esse "ID", por isso nossa busca demorou e extraiu o BLOB da API. Por trás dos panos, nossa aplicação recém gravou isso no uso do comando **`redisClient.setEx(chave, 60 segundos, valor)`**.
4. **Segundo Cenário (Com Cache):**
   - Na página que já respondeu (não recarregue e não troque o ID), clique no botão **Carregar Imagem do Servidor** novamente para pegar a mesma imagem ID `5`.
   - Repare na extrema velocidade! A aplicação vai devolver o dado quase que em tempo real (provavelmente algo em torno de **~5ms a 20ms** dependendo da sua internet e a localização do Cloud do Redis).
   - Origem: **REDIS (Cache)** (em verde).
   - *Por quê?* O Middleware interceptou o seu `redisClient.get(chave)` logo no início. Como ele percebeu que aquele "ID 5" existia com as imagens já em Base64 cacheada pelos últimos 60 segundos, ele pulou totalmente o bloco que consultava o seu banco de dados lento reduzindo quase **99% da latência**!

Toda vez que você for executar essa requisição num ID novo da "tabela", um Cache Miss será emitido e a imagem só virá pesada na primeira requisição. As seguintes serão quase intantâneas até o Tempo de Vida (TTL) de 60 segundos do respectivo arquivo estourar e ser invalidado.

---

## 📁 Estrutura de Arquivos
- `/src/server.js` - Instância o express e gerencia onde nossas rotas web estão servindo. 
- `/src/routes.js` - Criação de Rotas com os Handlers contendo a lógica central de buscar primeiro na abstração Redis e se der *Miss*, procurar no mock do Banco e gerar o Cache.
- `/src/redisClient.js` - Camada exclusiva da arquitetura onde isolamos conexões, chaves e credenciais para exportarmos pros módulos da API.
- `/public/*` - O Visual Frontend (arquivos estáticos em CSS, lógica local JS com API Fetching).
