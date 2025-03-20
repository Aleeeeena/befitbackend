const mongoose = require("mongoose");

const dietitianSubscriptionSchema = new mongoose.Schema({
    dietitianId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    }, // Dietitian's ID

    reports: { 
        type: Number, 
        default: 0 
    }, // Number of reports on the dietitian

    subscribers: [
        {
            userId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'users', 
                required: true 
            }, // Subscriber's ID

            amountPaid: { 
                type: Number, 
                required: true 
            }, // Amount paid by this subscriber

            startDate: { 
                type: Date, 
                default: Date.now 
            }, // When the subscription started

            expiryDate: { 
                type: Date, 
                default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
            }

        }
    ],

    paymentStatus: { 
        type: String, 
        enum: ["pending", "completed"], 
        default: "pending" 
    }, // Payment status of the dietitian

    isActive: { 
        type: Boolean, 
        default: true 
    }, // Whether the dietitian is active

    paymentId: { 
        type: String, 
        required: true 
    }, // Payment transaction ID

    totalEarnings: { 
        type: Number, 
        default: 0 
    }, // Total earnings of the dietitian

    monthlyEarnings: { 
        type: Number, 
        default: 0 
    } // Earnings of the dietitian in the current month

}, { timestamps: true });

const DietitianSubscription = mongoose.model('DietitianSubscription', dietitianSubscriptionSchema);
module.exports = DietitianSubscription;
