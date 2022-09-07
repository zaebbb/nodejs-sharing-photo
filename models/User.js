const {Schema, model} = require('mongoose')

const User = new Schema({
    first_name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        minLength: 11,
        maxLength: 11,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = model('User', User)