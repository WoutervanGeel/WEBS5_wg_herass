var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('underscore');

var mongoose = require('mongoose');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

require('../models/pokemon')(mongoose);
var Pokemon = mongoose.model('Pokemon');

var dataMapper = require('../datamappers/pokemon')(mongoose);

var app = require('express')();
var pokemonRoute = require('../routes/pokemon')(mongoose, dataMapper);
app.use('/pokemon', pokemonRoute);

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

before(function(done)
{
    mongoose.connect('mongodb://localhost:27017/pokemonapitest');
    dataMapper.mapAllPokemon(function(error)
    {
        done(error);
    }, function()
    {
        done();
    });
});

describe('Testing pokemon routes', function()
{
    describe('Testing /pokemon without query string.', function()
    {
        it('should return a list of the first 20 Pokemon names when no query string is provided.', function(done)
        {
            var expectedCount = 20;
            
            makeRequest('/pokemon', 200, function(err, res)
            {
                if(err) return done(err);
                
                expect(res.body).to.have.property('count').and.not.be.undefined;
                expect(res.body).to.have.property('results').and.not.be.undefined;
                expect(res.body.results).to.be.an('array');
                
                var actualCounted = 0;
                _.each(res.body.results, function(result)
                {
                    expect(result).to.have.property('name').and.not.be.undefined;
                    expect(result.name).to.be.an('string');
                    actualCounted++;
                });
                
                expect(actualCounted).to.equal(expectedCount);
                expect(res.body.count).to.equal(expectedCount);
            });
        });
    });
});