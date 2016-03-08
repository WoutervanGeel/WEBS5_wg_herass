var express = require('express');
var router = express.Router();

/* GET pokemon list */
router.get('/', function(req, res, next)
{
    var mockData =
    [
        {
            name:'Bulbasaur',
            types:
            [
                {
                    "slot": 1,
                    "name": "grass"
                },
                {
                    "slot": 2,
                    "name": "poison"
                }
            ]
        },
        {
            name:'Ivysaur',
            types:
            [
                {
                    "slot": 1,
                    "name": "grass"
                },
                {
                    "slot": 2,
                    "name": "poison"
                }
            ]
        },
        {
            name:'Venusaur',
            types:
            [
                {
                    "slot": 1,
                    "name": "grass"
                },
                {
                    "slot": 2,
                    "name": "poison"
                }
            ]
        }
    ];
    
    res.json(mockData);
});

module.exports = router;