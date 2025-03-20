const mongoose = require('mongoose');
const subscribers=require('./usersubscriptionmodel')
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { 
        type: String, 
        enum: ['admin', 'dietitian', 'user'], 
        default: 'user' 
    },

    // Dietitian-specific fields (conditionally required)
    certificate: { 
        type: String, 
        required: function() { return this.role === 'dietitian'; } 
    }, 

    experience: { 
        type: Number, 
        required: function() { return this.role === 'dietitian'; } 
    }, 

    specialization: { 
        type: String, 
        required: function() { return this.role === 'dietitian'; } 
    },

   
    isApproved: { 
        type: Boolean, 
        required: function() { return this.role === 'dietitian'; } ,
        default: false 
    }
    
    
    
    // Only relevant for dietitians

}, { timestamps: true });



userSchema.pre("findOneAndDelete", async function (next) {
    const user = await this.model.findOne(this.getFilter()); // Get the user being deleted
    if (user) {
        await subscribers.deleteMany({ userId: user._id }); // Delete related subscribers
    }
    next();
});

const users = mongoose.model('users', userSchema);
module.exports = users;

