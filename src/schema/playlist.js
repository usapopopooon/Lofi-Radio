const { Schema, model } = require("mongoose");

const Playlist = new Schema({
    Username: {
        type: String,
        required: false
    },
    UserId: {
        type: String,
        required: true
    },
    ClientId: {
        type: String,
        required: false
    },
    PlaylistName: {
        type: String,
        required: true
    },
    Playlist: {
        type: Array,
        required: true
    },
    CreatedOn: {
        type: Number,
        required: true
    }

});

module.exports = model('playlist', Playlist);
