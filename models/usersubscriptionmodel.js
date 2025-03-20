const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    }, // The user who is subscribing

    subscriptions: [
        {
            dietitianId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'users', 
                required: true 
            }, // Dietitian's ID

            amountPaid: { 
                type: Number, 
                required: true 
            }, // Amount paid to this dietitian

            startDate: { 
                type: Date, 
                default: Date.now 
            }, // When the subscription started

            expiryDate: { 
                type: Date, 
                default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
            } // Auto-expiry in 30 days
        }
    ]

}, { timestamps: true });

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);
module.exports = UserSubscription;
