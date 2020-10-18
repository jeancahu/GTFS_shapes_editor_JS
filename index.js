
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const port = 9000;

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', (request, response) => {
    response.sendFile(__dirname + "/index.html");
});

app.get('/editor', (request, response) => {
    response.sendFile(__dirname + "/index.html");
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

app.get('/css/TEMPLATE-CSS/:name', (request, response) => {
    const { name } = request.params;
    response.sendFile(__dirname + "/css/TEMPLATE-CSS/" + name);
});

app.get('/fonts/:name', (request, response) => {
    const { name } = request.params;
    response.sendFile(__dirname + "/templates/fonts/" + name);
});

app.get('/form', (request, response) => {
    response.sendFile( __dirname + "/templates/" + "form.html" );
})

app.get('/vue_js', (request, response) => {
    response.sendFile( __dirname + "/templates/" + "vue_js.html" );
})


app.get('/ejemplo', (request, response) => {

    // http://localhost:$port/ejemplo?name=algo
    const { name } = request.query;
    response.send(`Hello ${name || 'Anon'}!`);
})

app.get('/ejemplo/:name', (request, response) => {

    // http://localhost:$port/ejemplo?name=algo
    const { name } = request.params;
    response.send(`Hello ${name || 'Anon'}!`);
})

app.get('/process_get', (request, response) => {
    json_response = {
        first_name:request.query.first_name_get,
        last_name:request.query.last_name_get
    };
    // This is what we receive
    console.log(json_response);
    response.end(JSON.stringify(json_response));
})

// Use the application urlencodedParser
app.post('/process_post', urlencodedParser, (request, response) => {
    json_response = {
        first_name:request.body.first_name_post,
        last_name:request.body.last_name_post
    };
    // This is what we receive
    console.log(json_response);
    response.end(JSON.stringify(json_response));
})


// It serves static files
//app.use(express.static('/static'));
app.get('/static/:name', (request, response) => {
    // http://localhost:$port/ejemplo?name=algo
    const { name } = request.params;
    response.sendFile(__dirname + "/static/" + name);
})

app.get('/:name', (request, response) => {
    // http://localhost:$port/ejemplo?name=algo
    const { name } = request.params;
    response.sendFile(__dirname + "/templates/" + name);
})

// Start the server at port number 9000
console.log(`Server is running at address:port http://localhost:${port}\n`);
app.listen(port);
