const http = require('http');

console.log("Servidor en http://localhost:9000\n");
http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('Hello World');
    response.end();
}).listen(9000);
