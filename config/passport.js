function configure(passport, mongoose)
{
    var LocalStrategy = require('passport-local').Strategy;
    var User = mongoose.model('User');
    
    passport.serializeUser(function(user, done) 
    {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) 
    {
        User.findById(id, function(err, user) 
        {
            done(err, user);
        });
    });
    
    passport.use('local-signup', new LocalStrategy(
    {
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) 
    {
        process.nextTick(function()
        {
            console.log("HALLO HALLO HALLO");
        });
    }));
}

module.exports = configure;