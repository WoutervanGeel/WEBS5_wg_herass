var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Data Access Layer
mongoose.connect('mongodb://localhost:27017/pokemonapi');
// /Data Access Layer

// Models
require('./models/pokemon')(mongoose);
// /Models

function handleError(req, res, statusCode, message)
{
    console.log();
    console.log('-------- Error handled --------');
    console.log('Request Params: ' + JSON.stringify(req.params));
    console.log('Request Body: ' + JSON.stringify(req.body));
    console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
    console.log('-------- /Error handled --------');
    res.status(statusCode);
    res.json(message);
};

var dataMapper = require('./datamappers/pokemon')(mongoose);
dataMapper.mapAllPokemon();

var routes = require('./routes/index');
var pokemon = require('./routes/pokemon')(mongoose, dataMapper, handleError);

// MOCKING ROUTES
//var pokemon = require('./routes/mock/pokemonmock');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/pokemon', pokemon);

// send error in json.
app.use(function(err, req, res, next)
{
    if(!err){ next(); }
    res.status = err.status || 500;
    res.json(err.message || 'Internal Server Error');
});

// catch 404 and send in json.
app.use(function(req, res, next) 
{
    res.status(404);
    res.json('Not Found');
});

module.exports = app;
