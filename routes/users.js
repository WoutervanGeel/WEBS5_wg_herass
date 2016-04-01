

/* EXPORT FUNCTION */

module.exports = function(mongoose, passport)
{
	var User = mongoose.model('User');
    
    var express = require('express');
    var router = express.Router();
    var _ = require('underscore');

    /* ROUTING */

    router.post('/', passport.authenticate('local-signup',
    {
        successRedirect: '/',
        failureRedirect : '/',
        failureFlash : true
    }));
    // router.get('/', getUsers);
    // router.get('/:username', getOneUser);
    
    return router;
}