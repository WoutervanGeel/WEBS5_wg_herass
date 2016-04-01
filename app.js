var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Data Access Layer
mongoose.connect('mongodb://tjleeuwe1:Avans2016@ds011860.mlab.com:11860/pokemonapi');
// /Data Access Layer

// Models
require('./models/pokemon')(mongoose);
// /Models

var dataMapper = require('./datamappers/pokemon')(mongoose, 'http://pokeapi.co/api/v2');
dataMapper.mapAllPokemon(function(error)
{
    console.log(error);
}, function()
{
    console.log('Mapping of all external Pokemon names done.')
});

var routes = require('./routes/index');
var pokemon = require('./routes/pokemon')(mongoose, dataMapper);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//uncomment after placing your favicon in /public
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
    res.status(err.status || 500);
    
    var response = 
    {
        message: err.message || 'Internal Server Error'
    };
    
    if((err.errors) && (err.errors.length > 0))
    {
        response.errors = err.errors;
    }
    
    console.log(err);
    res.json(response);
});

// catch 404 and send in json.
app.use(function(req, res, next) 
{
    res.status(404);
    res.json({message: 'Not Found'});
});

module.exports = app;
