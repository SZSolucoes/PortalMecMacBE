
const app = require('express')();
const bodyParser = require('body-parser');
const axios = require('axios');
const _ = require('lodash');
//const stdin = process.openStdin();

const { mysqlCon } = require('./dbsconnect/ConnectFactory');
const fipeRest = require('./Fipe');
const vehicleRest = require('./Vehicle');
const itemManutencaoRest = require('./ItemManutencao');
const manutencao = require('./Manutencao');
const cbaros = require('./CBAros');
const comparos = require('./CompAros');
const cpmanual = require('./CPManual');

const httpserver = require('http').createServer(app);
const socketio = require('socket.io')(httpserver);

const sockets = [];

socketio.on('connection', socket => {
    sockets.push(socket);
    //console.log(socket.client.request.headers);
});

/* stdin.addListener("data", (d) => {
    if (sockets.length > 0) {
        sockets.forEach((socket) => socket.emit('TESTE', d.toString().trim()))
    }
}); */

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Adiciona os servicos ao app
fipeRest(app, mysqlCon, sockets, axios, _);
vehicleRest(app, mysqlCon, sockets, axios, _);
itemManutencaoRest(app, mysqlCon, sockets, axios, _);
manutencao(app, mysqlCon, sockets, axios, _);
cbaros(app, mysqlCon, sockets, axios, _);
comparos(app, mysqlCon, sockets, axios, _);
cpmanual(app, mysqlCon, sockets, axios, _);

httpserver.listen(8013, '0.0.0.0', () => {
  console.log('servidor iniciado na porta 8013!');
});
