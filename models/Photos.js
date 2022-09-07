const {Schema, model} = require('mongoose')

const Photos = new Schema({
    name: {
        type: 'string',
        required: true,
    },
    url: {
        type: 'string',
        required: true,
    },
    author_id: {
        type: 'string',
        required: true,
    }
})

module.exports = model('Photos', Photos)