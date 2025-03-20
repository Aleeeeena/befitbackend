const Treatment = require("../models/treatmentmodel");



// ✅ Fetch Chat Messages
exports.getChat = async (req, res) => {
    try {
        const { dietitianId, clientId } = req.params;

        // Find treatment document by dietitian ID and client ID
        const treatment = await Treatment.findOne({
            dietitian: dietitianId,
            "clients.clientId": clientId,
        });

        if (!treatment) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Find the client inside the clients array
        const clientData = treatment.clients.find(client => client.clientId.toString() === clientId);

        if (!clientData) {
            return res.status(404).json({ message: "Client not found in treatment" });
        }

        // Format chat messages
        const formattedChat = clientData.chat.map(msg => ({
            sender: msg.senderModel === "DietitianSubscription" ? "diet" : "client",
            message: msg.message,
            timestamp: msg.timestamp,
        }));

        res.status(200).json(formattedChat);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Send a Message
exports.sendMessage = async (req, res) => {
    try {
        const { dietitianId, clientId } = req.params;
        const { senderId, senderModel, message } = req.body;

        // Validate senderModel
        if (!["DietitianSubscription", "UserSubscription"].includes(senderModel)) {
            return res.status(400).json({ message: "Invalid sender type" });
        }

        const treatment = await Treatment.findOne({
            dietitian: dietitianId,
            "clients.clientId": clientId,
        });

        if (!treatment) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const clientIndex = treatment.clients.findIndex(client => client.clientId.toString() === clientId);

        if (clientIndex === -1) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Push new message
        treatment.clients[clientIndex].chat.push({
            sender: senderId,
            senderModel,
            message,
        });

        await treatment.save();
        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
