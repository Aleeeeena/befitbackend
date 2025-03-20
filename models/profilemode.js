const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',
        required: true
    }, 
    dp: { 
        type: String 
    },
    name: {
        type: String
    },
    height: {
        type: Number
    },
    weight: {
        type: Number
    },
    age: {
        type: Number
    },
    email: {
        type: String
    }
});

const ProfileModel = mongoose.model('Profile', profileSchema);
module.exports = ProfileModel;
