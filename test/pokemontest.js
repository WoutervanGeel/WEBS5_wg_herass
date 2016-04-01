var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('underscore');
var async = require('async');

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
    this.timeout(30000);
    mongoose.connect(''); //Does not matter what we connect to mockgoose intercepts the call.
    dataMapper.mapAllPokemon(function(error)
    {
        done(error);
    }, function()
    {
        done();
    });
});

describe('Testing /pokemon route', function()
{
    describe('Testing /pokemon with positive results.', function()
    {
        it('should return a list of the first 20 Pokemon names when no query string is provided. HTTP CODE = 200', function(done)
        {
            var databasePokemon;
            async.series
            ([
                function(callback)
                {
                    Pokemon.find({}, function(error, doc)
                    {
                        if (error) return callback(error);
                        databasePokemon = doc;
                        callback();
                    });
                },
                function(callback)
                {
                    var expectedCount = 20;
                    
                    makeRequest('/pokemon', 200, function(err, res)
                    {
                        if(err) return callback(err);
                        
                        expect(res.body).to.have.property('count');
                        expect(res.body).to.have.property('results');
                        expect(res.body.results).to.be.an('array');
                        
                        var actualCounted = 0;
                        _.each(res.body.results, function(result)
                        {
                            expect(result).to.have.property('name');
                            expect(result.name).to.be.an('string');
                            expect(result.name).to.equal(databasePokemon[actualCounted].name);
                            actualCounted++;
                        });
                        
                        expect(actualCounted).to.equal(expectedCount);
                        expect(res.body.count).to.equal(expectedCount);
                        
                        callback();
                    });
                }
            ], function(error)
            {
                if(error) done(error);
                else done();
            });
        });
        it('should return a list of 60 pokemon starting from the 21st index. HTTP CODE = 200', function(done)
        {
            var databasePokemon;
            async.series
            ([
                function(callback)
                {
                    Pokemon.find({}, function(error, doc)
                    {
                        if(error) return callback(error);
                        databasePokemon = doc;
                        callback();
                    });
                }, function(callback)
                {
                    var expectedCount = 60;
                    
                    makeRequest('/pokemon?limit=60&offset=20', 200, function(err, res)
                    {
                        if(err) return callback(err);
                        
                        expect(res.body).to.have.property('count').and.not.be.undefined;
                        expect(res.body).to.have.property('results').and.not.be.undefined;
                        expect(res.body.results).to.be.an('array');
                        
                        var arrayIndex = 20; //Used as index for the databasePokemon array.
                        var actualCounted = 0;
                        _.each(res.body.results, function(result)
                        {
                            expect(result).to.have.property('name').and.not.be.undefined;
                            expect(result.name).to.be.an('string');
                            expect(result.name).to.equal(databasePokemon[arrayIndex].name);
                            actualCounted++;
                            arrayIndex++;
                        });
                        
                        expect(actualCounted).to.equal(expectedCount);
                        expect(res.body.count).to.equal(expectedCount);
                        
                        callback();
                    });
                }
            ], function(error)
            {
                if(error) done(error);
                else done();
            });
        });
    });
    describe('Testing /pokemon with negative results.', function()
    {
        it('should return HTTP 400 if limit or offset is not a number.', function(done)
        {
            makeRequest('/pokemon?limit=g&offset=a', 400, function(err, res)
            {
                if(err) return done(err);
                done();
            });
        });
        it('should return HTTP 400 if limit or offset is a non positive number.', function(done)
        {
            makeRequest('/pokemon?limit=-1&offset=-1', 400, function(err, res)
            {
                if(err) return done(err);
                done();
            });
        });
    });
});

describe('Testing /pokemon/:name route', function()
{
    var testData =
    {
        externalUrl: '',
        index: 0,
        name: 'testerino',
        types: [{slot:1,name:'normal'},{slot:2,name:'flying'}],
        moves: [{name:'TestMove1'},{name:'TestMove2'},{name:'TestMove3'}]
    };
    var testPokemon = new Pokemon(testData);
    before(function(done)
    {
        testPokemon.save(function(err, savedPokemon)
        {
            if(err) return done(err);
            done();
        });
    });
    describe('Testing /pokemon/:name with positive results.', function()
    {
        it('should return Pokemon data.', function(done)
        {
            makeRequest('/pokemon/testerino', 200, function(err, res)
            {
                if(err) return done(err);
                
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('types');
                expect(res.body).to.have.property('moves');
                
                expect(res.body.name).to.equal(testData.name);
                expect(res.body.types).to.deep.equal(testData.types);
                expect(res.body.moves).to.deep.equal(testData.moves);
                
                done();
            });
        });
    });
    describe('Testing /pokemon/:name with negative results.', function()
    {
       it('should return HTTP 404 when no name matches a Pokemon in the database.', function(done)
       {
           makeRequest('/pokemon/nonexisting', 404, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    after(function(done)
    {
        testPokemon.remove(function(err, removedPokemon)
        {
            if(err) return done(err);
            done();
        });
    });
});

after(function(done)
{
    mongoose.unmock(function()
    {
        done();
    });
});