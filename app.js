var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');

// Data Access Layer
mongoose.connect('mongodb://tjleeuwe1:Avans2016@ds011860.mlab.com:11860/pokemonapitest');
// /Data Access Layer

// Models
require('./models/pokemon')(mongoose);
require('./models/user')(mongoose);
// /Models

require('./config/passport')(passport, mongoose);

var dataMapper = require('./datamappers/pokemon')(mongoose, 'http://pokeapi.co/api/v2');

var routes = require('./routes/index');
var pokemon = require('./routes/pokemon')(mongoose, dataMapper);
var users = require('./routes/users')(mongoose, passport);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function(req, res, next)
{
    process.nextTick(function()
    {
        dataMapper.mapAllPokemon(function(error)
        {
            console.log(error);
            next(error);
        }, function()
        {
            console.log('Mapping of all external Pokemon names done.');
            next();
        });
    });
});

app.use('/', routes);
app.use('/pokemon', pokemon);
app.use('/users', users);

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
