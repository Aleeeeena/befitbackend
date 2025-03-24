const paypal=require('../config/paypalConfig');
const DietitianSubscription = require('../models/dietitiansubscriptionmodel');
const subscription = require('../models/subscriptionmodel');
const UserSubscription = require('../models/usersubscriptionmodel');


exports.createPayment = async (req, res) => {
    const { userId, dietitianId, amount } = req.body;

    const create_payment_json = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
            return_url: "https://befitbackend.onrender.com/success",
            cancel_url: "https://befitbackend.onrender.com/cancel"
        },
        transactions: [{
            amount: { currency: "USD", total: amount },
            description: `Subscription payment for dietitian ${dietitianId}`
        }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            console.log(error);
            res.status(500).json({ error: "Payment creation failed" ,error});
        } else {
            for (let link of payment.links) {
                if (link.rel === "approval_url") {
                    res.json({ forwardLink: link.href });
                }
            }
        }
    });
};

exports.successPayment = async (req, res) => {
    try {
        const { PayerID, paymentId } = req.query;

        if (!PayerID || !paymentId) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const execute_payment_json = { payer_id: PayerID };

        paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
            if (error) {
                console.log("PayPal Error:", error);
                return res.status(500).json({ error: "Payment execution failed" });
            }

            try {
                console.log("Payment Response:", payment);

                const { userId, dietitianId } = JSON.parse(payment.transactions[0].custom);
                const amount = 50; // Ensure the amount is always set to 50

                if (!dietitianId || !userId) {
                    return res.status(400).json({ error: "Missing necessary transaction data" });
                }

                // Store subscription in UserSubscription model
                await UserSubscription.findOneAndUpdate(
                    { userId },
                    {
                        $push: {
                            subscriptions: {
                                dietitianId,
                                amountPaid: amount,
                                startDate: new Date(),
                                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                // Store subscription in DietitianSubscription model
                await DietitianSubscription.findOneAndUpdate(
                    { dietitianId },
                    {
                        $push: {
                            subscribers: {
                                userId,
                                amountPaid: amount,
                                startDate: new Date(),
                                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            }
                        },
                        $inc: { 
                            totalEarnings: amount, 
                            monthlyEarnings: amount
                        },
                        paymentStatus: "pending",
                        isActive: true,
                        reports:0,
                        paymentId
                    },
                    { upsert: true, new: true }
                );

                console.log("Subscription saved successfully!");
                //res.json({ message: "Payment successful", payment });
                res.redirect("http://localhost:5173/success");

            } catch (dbError) {
                console.error("Error saving subscription:", dbError);
                res.status(500).json({ error: "Subscription saving failed" });
            }
        });
    } catch (error) {
        console.log("Unexpected Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};





exports.cancelPayment = (req, res) => {
    res.json({ message: "Payment cancelled" });
};
