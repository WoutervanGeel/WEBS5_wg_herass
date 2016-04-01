function init(mongoose)
{
    require('mongoose-type-email');
    var bcrypt   = require('bcrypt-nodejs');
    var Schema = mongoose.Schema;

    var userSchema = new Schema
    ({
        username:
        {
            type: String,
            required: [true, 'Username is required.'],
            index: { unique: true }
        },
        local:
        {
            email:
            {
                type: mongoose.SchemaTypes.Email,
                required: [true, 'Email is required.']
            },
            password:
            {
                type: String,
                required: [true, 'Password is required.']
            }
        }
    });
    
    userSchema.methods.generateHash = function(password) 
    {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    userSchema.methods.validPassword = function(password) 
    {
        return bcrypt.compareSync(password, this.local.password);
    };
        
    mongoose.model('User', userSchema);
};

module.exports = init;