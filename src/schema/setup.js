const { Schema, model} = require('mongoose');

let Setup = new Schema({
    Guild : String,
    ClientId: String,
    Channel: String,
    Message: String,
    voiceChannel: String,
})

module.exports = model('Setup', Setup);
