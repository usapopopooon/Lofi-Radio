const { Schema, model} = require('mongoose');

let mode = new Schema({
    Guild : String,
    ClientId: String,
    mode : String, 
    oldmode: String,
})

module.exports = model('mode', mode);
