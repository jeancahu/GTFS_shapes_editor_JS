const express = require('express');
const app = express();

// Este es el resultado a pedir la dirección /
app.get('/', (request, response) => response.send("Hello World!"));

app.get('/ejemplo', (request, response) => {

    // http://localhost:9000/ejemplo?name=algo
    const { name } = request.query;
    response.send(`Hello ${name || 'Anon'}!`);
})

app.get('/ejemplo/:name', (request, response) => {

    // http://localhost:9000/ejemplo?name=algo
    const { name } = request.params;
    response.send(`Hello ${name || 'Anon'}!`);
})

// Iniciamos el servidor
console.log("Servidor en http://localhost:9000\n");
app.listen(9000);
