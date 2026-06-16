const { Schema, model} = require('mongoose');

let Radio = new Schema({
    Guild : String,
    ClientId: String,
    Radio : String, 
    oldradio: String,
})

module.exports = model('station', Radio);
