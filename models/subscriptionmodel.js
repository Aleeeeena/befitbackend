const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', // Reference to users model
        required: true
    }, // User who subscribed

    dietitianIds: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    }], // Array of dietitians the user subscribed to

    subscribers: [{ 
        dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // Dietitian ID
        userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }] // Users subscribed to this dietitian
    }], // List of users subscribing to each dietitian

    totalamountearnedbydietitian: [{ 
        dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
        amount: { type: Number, default: 0 } 
    }], // Total amount earned by each dietitian

    montlyamountEarnedByEachDietitian: [{ 
        dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
        amount: { type: Number, default: 0 } 
    }], // Monthly earnings per dietitian

    startDate: { 
        type: Date, 
        default: Date.now 
    }, // Date subscription started

    expiryDate: { 
        type: Date, 
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Auto-expires in 30 days
    }, // Date subscription ends

    paymentStatusofdietitianbyadmin: [{ 
        dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' } 
    }], // Payment status per dietitian

    isActive: { 
        type: Boolean, 
        default: true 
    }, // If the subscription is still active

    reports: [{ 
        dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
        count: { type: Number, default: 0 } 
    }], // Reports per dietitian

    upidofdietitian: [{ 
        dietitianId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
        upiId: { type: String, required: true } 
    }] // UPI ID per dietitian for payment

}, { timestamps: true });

const subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = subscription