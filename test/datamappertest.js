var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var async = require('async');

var mongoose = require('mongoose');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

require('../models/pokemon')(mongoose);
var Pokemon = mongoose.model('Pokemon');

var dataMapper = require('../datamappers/pokemon')(mongoose, 'localhost:3000/test');

var app = require('express')();
var MockExternalAPIRoute = require('../mock/routes/externalapimock')(mongoose, dataMapper);
app.use('/', MockExternalAPIRoute);

var testmon =
{
    index: 1,
    name: 'testmon1',
    moves: 
    [{
        name: 'move1'
    },
    {
        name: 'move2'
    }],
    types:
    [{
        slot: 1,
        name: 'flying'
    },
    {
        slot: 2,
        name: 'normal'
    }],
    isMapped: true
};

before(function(done)
{
    this.timeout(30000);
    mongoose.connect(''); //Does not matter what we connect to mockgoose intercepts the call.
    done();
});
describe('Testing DataMapper', function()
{
    it('should map all Pokemon names available from external source.', function(done)
    {
        dataMapped.mapAllPokemon(function(error)
        {
            done(error);
        }, function()
        {
            Pokemon.find({}, function(err, docs)
            {
                if(err) return done(err);
                
                expect(docs).to.have.lengthOf(3);
                
                done();
            });
        });
    });
    it('should map individual Pokemon when its URL is called.', function(done)
    {
        dataMapper.mapPokemon(new Pokemon({name: testmon.name}), function(err)
        {
            done(err);
        }, 
        function(doc)
        {
            expect(doc).to.have.property('index');
            expect(doc).to.have.property('name');
            expect(doc).to.have.property('moves');
            expect(doc).to.have.property('types');
            expect(doc).to.have.property('isMapped');
            
            expect(doc.index).to.equal(testmon.index);
            expect(doc.name).to.equal(testmon.name);
            expect(doc.moves).to.deep.equal(testmon.moves);
            expect(doc.types).to.deep.equal(testmon.types);
            expect(doc.isMapped).to.be.true;
            
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