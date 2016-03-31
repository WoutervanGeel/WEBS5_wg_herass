function init(mongoose)
{
    var Schema = mongoose.Schema;
    
    var typeSchema = new Schema
    ({
        slot: 
        {
            type: Number,
            min: 1,
            max: 2,
            required: [true, 'Type slot is required (Either 1 or 2).']
        },
        name: 
        {
            type: String,
            enum:
            ['normal', 'fighting', 'flying', 'normal', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
            'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy', 'unknown', 'shadow'],
            required: [true, 'Type name is required.']
        }
    });
    var moveSchema = new Schema
    ({
        name: 
        {
            type: String,
            required: [true, 'Move name is required.']
        }
    });
    var pokemonSchema = new Schema
    ({
        index:
        {
            type: Number,
            index: { unique: true }
        },
        name:
        {
            type: String,
            required: [true, 'Name is required.']
        },
        types: 
        {
            type: [typeSchema]
        },
        moves: 
        { 
            type: [moveSchema]
        },
        isMapped:
        {
            type: Boolean
        }
    });
    
    mongoose.model('Pokemon', pokemonSchema);
};

module.exports = init;