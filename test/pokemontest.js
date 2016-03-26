var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pokemonapitest');

var dataMapper = require('./datamappers/pokemon')(mongoose);

var app = require('express')();
var pokemon = require('./routes/pokemon')(mongoose, dataMapper, handleError);
app.use('/', calendar);

function makeRequest(route, statusCode, done)
{
	request(app).get(route).expect(statusCode).end(function(err, res)
    {
        if(err)
        { 
            return done(err);
        }

        done(null, res);
    });
};

describe('Testing pokemon routes', function()
{
    describe('Testing /pokemon')
});