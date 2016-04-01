var express = require('express');
var router = express.Router();

var testmon =
{
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
    }]
};

router.get('/pokemon/?limit=811', function(req, res)
{
    var result =
    {
        count: 3,
        results:
        [{
            name: "testmon1"
        },
        {
            name: "testmon2"
        },
        {
            name: "testmon3"
        }]
    }
    res.status(200);
    res.json(result);
});

router.get('pokemon/:name', function(req, res)
{
    var name = req.params.name;
    
    switch(name)
    {
        case 'testmon1':
            testmon.name = testmon1;
            break;
        case 'testmon2':
            testmon.name = testmon2;
            break;
        case 'testmon3':
            testmon.name = testmon3;
            break;
        default:
            res.status(404);
            res.json('Not Found');
    }
    
    res.status(200);
    res.json(testmon);
});

module.exports = router;