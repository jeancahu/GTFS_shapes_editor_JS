
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const port = 9000;

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
    response.sendFile(__dirname + "/index.html");
});

app.get('/:name', (request, response) => { // FIXME temporal
    const { name } = request.params;
    console.log(name);
    response.sendFile(__dirname + '/' + name);
});

app.get(':name', (request, response) => { // FIXME temporal
    const { name } = request.params;
    console.log(name);
    response.sendFile(__dirname + '/' + name);
});

app.get('/js/:name', (request, response) => {
    const { name } = request.params;
    console.log(__dirname + "/templates/js/" + name + ": JS request");
    response.sendFile(__dirname + "/js/" + name);
});

app.get('/css/:name', (request, response) => {
    const { name } = request.params;
    response.sendFile(__dirname + "/css/" + name);
});

app.get('/fonts/:name', (request, response) => {
    const { name } = request.params;
    response.sendFile(__dirname + "/templates/fonts/" + name);
});

app.get('/ejemplo', (request, response) => {

    // http://localhost:$port/ejemplo?name=algo
    const { name } = request.query;
    response.send(`Hello ${name || 'Anon'}!`);
});

app.get('/ejemplo/:name', (request, response) => {

    // http://localhost:$port/ejemplo?name=algo
    const { name } = request.params;
    response.send(`Hello ${name || 'Anon'}!`);
});

app.get('/process_get', (request, response) => {
    json_response = {
        first_name:request.query.first_name_get,
        last_name:request.query.last_name_get
    };
    // This is what we receive
    console.log(json_response);
    response.end(JSON.stringify(json_response));
});

// Use the application urlencodedParser
app.post('/input_path_history', (request, response) => {
    console.log(request.body);

    response.end(); // post end
});

app.post('/input_path_gtfs', (request, response) => {
    console.log(request.body);

    response.end(""); // post end
});

// It serves static files
//app.use(express.static('/static'));
app.get('/static/:name', (request, response) => {
    // http://localhost:$port/ejemplo?name=algo
    const { name } = request.params;
    response.sendFile(__dirname + "/static/" + name);
});

app.get('/assets/img/:name', (request, response) => {
    const { name } = request.params;
    console.log(__dirname + "/assets/img/" + name + ": JS request");
    response.sendFile(__dirname + "/assets/img/" + name);
});

// Start the server at port number 9000
console.log(`Server is running at address:port http://localhost:${port}\n`);
app.listen(port);
