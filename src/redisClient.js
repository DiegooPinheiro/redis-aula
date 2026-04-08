require('dotenv').config();
const redis = require('redis');
const cliente = redis.createClient({
    url: process.env.REDIS_URL
});

cliente.on('connect', () => {
    console.log('Redis Conectado ao Cloud!')
});
cliente.on('error', (err) => {
    console.error('Erro ao conectar ao Redis Cloud:', err);
});
(async () => {
    await cliente.connect();
})();
module.exports = cliente;