var express = require('express');
var router = express.Router();
var request = require('request');

var baseExternalURL = 'http://pokeapi.co/api/v2';

/* GET pokemon list */
router.get('/', function(req, res, next)
{
    request(baseExternalURL + '/pokemon', function(error, response, body) 
    {
       var json = JSON.parse(body);
        
        res.json(json);
    });
});

module.exports = router;