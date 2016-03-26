var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');

var handleError;
var Pokemon;
var DataMapper;



/* REQUEST HANDLER FUNCTIONS */

function getPokemon(req, res, next)
{
    var limit = 20;
    var offset = 0;
    
    //If both offset and limit parameters are set.
    var query = req.query;
    var errors = checkUrlQueryValues(query);
    if(errors !== "")
    {
        err = new Error();
        err.status = 400;
        err.message = errors;
        return next(err);
    }
    else
    {
        limit = query.limit;
        offset = query.offset;
    }
    
    Pokemon.find(function(err, docs)
    {
        if(err)
        {
            err = new Error();
            err.status = 500;
            err.message = 'Internal Server Error';
            return next(err);
        }
        
        var results = 
        {
            count: 0,
            results: []
        };
        
        var index = 1;
        _.every(docs, function(doc)
        {
            if(results.count < limit)
            {
                if(index > offset)
                {
                    results.results.push
                    ({
                        name: doc.name
                    });
                    results.count++;
                }
            }
            else return false;

            index++;
            return true;
        });
        
        res.status(200);
        res.json(results);
    });
};

function getOnePokemon(req, res, next)
{
    var query = 
    {
        name: req.params.name
    }
    Pokemon.findOne(query, function(err, doc)
    {
        if(doc == null)
        {
            return next();
        }
        
        if(err)
        { 
            err = new Error();
            err.status = 500;
            err.message = 'Internal Server Error';
            return next(err);
        }
        
        if(doc.externalUrl !== "")
        {
            DataMapper.mapPokemon(doc, res);
        }
        else
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
        }
    });
};

/* ROUTING */

router.get('/', getPokemon);
router.get('/:name', getOnePokemon);

/* URL VALIDATION */

function checkUrlQueryValues(query)
{
    var errors = "";
    //If both offset and limit parameters are set.
    if((typeof query.limit !== typeof undefined)&&(typeof query.offset !== typeof undefined))
    {
        limit = parseInt(query.limit);
        offset = parseInt(query.offset);
        
        //Validate parameter values.
        if((isNaN(limit))||(limit < 1))
        {
            errors += "Wrong parameter value input. Page parameter must be a positive number. ";
        }
        
        if((isNaN(offset))||(offset < 0))
        {
            errors += "Wrong parameter value input. Amount parameter must be a positive number or zero.";
        }
    }
    return errors;
}

/* EXPORT FUNCTION */

module.exports = function(mongoose, mapper, errCallback)
{
	console.log('Initializing pokemon routing module');
    handleError = errCallback;
    DataMapper = mapper;
	Pokemon = mongoose.model('Pokemon');
	return router;
};