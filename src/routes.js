const express = require('express');
const redisClient = require('./redisClient')

const route = express.Router();

//simula banco lento
const fakeDatabase = async (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id, nome: `Produto ${id}`, preco: Math.random() * 100 });
        }, 2000);
    });
}

//verificar se tem cache
route.get('/produto/:id', async (req, res) => {
    const { id } = req.params;

    try {
        //1. Tenta buscar no Redis
        const cacheValue = await redisClient.get(`produto:${id}`);

        if (cacheValue) {
            console.log('Cache Hit!');
            return res.json({ data: JSON.parse(cacheValue), source: 'redis' });
        }

        //2. Se não tiver, busca no banco lento
        console.log('Cache Miss! Buscando no banco...');
        const produto = await fakeDatabase(id);

        //3. Salva no Redis para a próxima vez (com TTL de 60s)
        await redisClient.setEx(`produto:${id}`, 60, JSON.stringify(produto));

        res.json({ data: produto, source: 'database' });
    } catch (error) {
        console.error('Erro na rota /produto/:id:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// simula banco lento retornando um BLOB de imagem
const fakeImageDatabase = async (id) => {
    return new Promise(async (resolve) => {
        // Atraso de 2 segundos para simular a extração do BLOB do banco de dados
        setTimeout(async () => {
            try {
                const response = await fetch(`https://picsum.photos/seed/${id}/400/300`);
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const imageBlob = `data:image/jpeg;base64,${base64}`;
                
                resolve({ 
                    id, 
                    nome: `Imagem de Teste ${id}`, 
                    tamanho_bytes: buffer.byteLength,
                    blob: imageBlob 
                });
            } catch (error) {
                resolve({ id, erro: 'Falha ao gerar imagem' });
            }
        }, 2000);
    });
}

// Rota para carregar imagens aplicando camada de cache Redis
route.get('/imagem/:id', async (req, res) => {
    const { id } = req.params;
    const startTime = Date.now();

    try {
        // 1. Verificar Redis (Cache)
        const cacheValue = await redisClient.get(`imagem:${id}`);

        if (cacheValue) {
            console.log(`Cache Hit para imagem ${id}!`);
            const timeTakenMs = Date.now() - startTime;
            return res.json({ 
                data: JSON.parse(cacheValue), 
                source: 'redis', 
                timeTakenMs 
            });
        }

        // 2. Se não existir no cache (Miss), buscar no BD simulado
        console.log(`Cache Miss para imagem ${id}! Consultando no banco...`);
        const imagem = await fakeImageDatabase(id);

        // 3. Salvar o BLOB em cache para as próximas chamadas (TTL 60s)
        await redisClient.setEx(`imagem:${id}`, 60, JSON.stringify(imagem));

        const timeTakenMs = Date.now() - startTime;
        res.json({ 
            data: imagem, 
            source: 'database', 
            timeTakenMs 
        });
    } catch (error) {
        console.error('Erro na rota /imagem/:id:', error);
        res.status(500).json({ error: 'Erro ao processar imagem' });
    }
});

module.exports = route;