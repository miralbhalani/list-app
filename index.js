const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./config');
const cors = require('cors');

const DependancyResolver = require('./lib/DependancyResolver');
const mongocon = require('./lib/mongocon');
const authController = require('./modules/authModule/authController');
const listController = require('./modules/listModule/listController');

const app = express();
const port = 3000;

var depResolver = new DependancyResolver();
depResolver.addDependancy("dbClient", mongocon.dbClient);
depResolver.addDependancy("db", mongocon.db);

if(config.env == "dev") {
    console.log("RUNNING ON DEV WITH CORS")
    app.use(cors({
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }));    
}

app.use(express.json());
app.use(mongoSanitize());
var authControllerAttach = depResolver.attach(authController);
var listControllerAttach = depResolver.attach(listController);

app.post('/token', authControllerAttach.getToken);

app.use(authControllerAttach.validateToken);

app.get('/list', listControllerAttach.getLists);
app.post('/list', listControllerAttach.createList);
app.patch('/list/:id', listControllerAttach.updateListTitle);
app.delete('/list/:id', listControllerAttach.deleteList);
app.post('/list/:id/items', listControllerAttach.addListItem);
app.put('/list/:id/items/:itemId', listControllerAttach.updateListItem);
app.delete('/list/:id/items/:itemId', listControllerAttach.deleteListItem);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
});

var server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
  
server.on('close', async () => {
    await mongocon.onServerClose()
});

process.on('SIGINT', async () => {
    await mongocon.onSIGINT()
});

module.exports = {
    app,
    server
}