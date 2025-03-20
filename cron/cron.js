const cron = require('node-cron');
const mongoose = require('mongoose');
const subscribers = require('../models/usersubscriptionmodel');

cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Normalize time to start of the day (UTC)

        console.log("Running expired subscription cleanup...");

        // Find users with at least one expired subscription
        const expiredUsers = await subscribers.find({
            "subscriptions.expiryDate": { $lte: today }
        });

        if (expiredUsers.length > 0) {
            console.log(`Found ${expiredUsers.length} users with expired subscriptions.`);

            for (const user of expiredUsers) {
                // Remove expired subscriptions from the user document
                await subscribers.updateOne(
                    { _id: user._id },
                    { $pull: { subscriptions: { expiryDate: { $lte: today } } } }
                );

                // Fetch the updated document to check if there are remaining subscriptions
                const updatedUser = await subscribers.findById(user._id);

                if (!updatedUser.subscriptions || updatedUser.subscriptions.length === 0) {
                    console.log(`Deleting user: ${user.userId.username} (ID: ${user.userId._id}) as all subscriptions expired.`);
                    await subscribers.findByIdAndDelete(user._id);
                }
            }

            console.log("Expired subscriptions cleaned up successfully.");
        } else {
            console.log("No expired subscriptions found.");
        }
    } catch (error) {
        console.error("Error cleaning up expired subscriptions:", error);
    }
});
