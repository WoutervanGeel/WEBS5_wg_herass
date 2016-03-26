var async = require('async');
var request = require('request');
var _ = require('underscore');
var Pokemon;

var dataMapper =
{
    mapAllPokemon: function()
    {
        Pokemon.find({}, function(error, doc)
        {
            if(error) return console.log(error);
            
            if(doc.length == 0)
            {
                console.log('Mapping pokemon names and external url from external API.');
                request('http://pokeapi.co/api/v2/pokemon/?limit=811', function(error, response, body) 
                {
                    var externalData = JSON.parse(body);
                
                    for(var i = 0; i < 811; i++)
                    {
                        var pokemon = new Pokemon(); //name: externalData.results[i].name
                        pokemon.name = externalData.results[i].name;
                        pokemon.externalUrl = externalData.results[i].url;
                        pokemon.save(function(error, savedPokemon)
                        {
                            if(error) return console.log(error);
                        });
                    }
                });
            }
            else
            {
                console.log("Mapping of pokemon names not needed.")    
            }
        });
    },
    
    mapPokemon: function(pokemon, res)
    {
        var updatedData;
        async.series
        ([
            function(callback)
            {
                request(pokemon.externalUrl, function(error, response, body)
                {
                    if(error) return callback(error);
                    
                    var externalPokemon = JSON.parse(body);
                    
                    var types = [];
                    _.each(externalPokemon.types, function(typeData)
                    {
                        var type = 
                        {
                            slot: typeData.slot,
                            name: typeData.type.name
                        };
                        types.push(type);
                    });
                    
                    var moves = [];
                    _.each(externalPokemon.moves, function(moveData)
                    {
                        var move = 
                        {
                            name: moveData.move.name
                        };
                        moves.push(move);
                    });
                    
                    updatedData = 
                    {
                          externalUrl: "",
                          types: types,
                          moves: moves
                    };
                    
                    return callback();
                });
            },
            function(callback)
            {
                pokemon.update(updatedData, function(error, numAffected)
                {
                    if(error) return callback(error);
                    console.log("Pokemon data mapped for: " + pokemon.get('name'));
                    callback();
                });
            }
        ], function(error)
        {
            if(error) return console.log(error);
            
            Pokemon.findOne({ name: pokemon.name }, function(err, doc)
            {
                var types = []
                _.each(doc.get('types'), function(rawType)
                {
                    var type =
                    {
                        slot: rawType.slot,
                        name: rawType.name
                    };
                    types.push(type);
                });
                var moves = []
                _.each(doc.get('moves'), function(rawMove)
                {
                    var move =
                    {
                        name: rawMove.name
                    };
                    moves.push(move);
                });
                var response =
                {
                    name: doc.get('name'),
                    types: types,
                    moves: moves
                };
                res.status(200);
                res.json(response);
            });
        });
    }
};

module.exports = function(mongoose)
{
    Pokemon = mongoose.model('Pokemon');
    return dataMapper;
};