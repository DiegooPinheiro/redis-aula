const redis = require('redis');
const cliente = redis.createClient({
    url: 'redis://default:0kUdMcYppetyVad0ydBVrqH8TH3JT4AW@redis-14257.crce278.sa-east-1-2.ec2.cloud.redislabs.com:14257'
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