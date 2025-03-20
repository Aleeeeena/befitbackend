const users = require('../models/usermodel')
const dietitianmodel=require('../models/dietitiansubscriptionmodel');
const Treatment = require('../models/treatmentmodel');
const UserSubscription = require('../models/usersubscriptionmodel');

const mongoose=require('mongoose')

exports.dietitianregistercontroller = async (req, res) => {
    const { username, password, email, role, experience, specialization } = req.body;

    // Ensure req.file exists before accessing its path
    const certificate = req.file ? req.file.path : null;

    try {
        const existinguser = await users.findOne({ email });

        if (existinguser) {
            return res.status(406).json("Dietitian already registered");
        }

        if (!certificate) {
            return res.status(400).json({ error: "Certificate is required" });
        }

        const newuser = new users({
            username,
            password,
            email,
            role,
            certificate,
            experience,
            specialization
        });

        await newuser.save();
        res.status(200).json("Dietitian registered successfully");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//get all subscribed clients

exports.getAllClients = async (req, res) => {
    const id = req.params.id; // Extract dietitian ID

    try {
        // Find the dietitian and populate subscriber details
        const result = await dietitianmodel.findOne({ dietitianId: id })
            .populate({
                path: "subscribers.userId", // Correct path for populating users
                select: "username email role", // Select required fields
            });

        if (!result) {
            return res.status(404).json({ message: "Dietitian not found" });
        }

        res.status(200).json(result.subscribers); // Send subscribers (clients) with user details
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
    }
};




// Add or update treatment details & chat for a client


exports.addOrUpdateTreatment = async (req, res) => {
  try {
    const { dietitianId, clientId, treatmentDetails, chatMessage, senderId, senderType } = req.body;

    if (!dietitianId || !clientId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let treatment = await Treatment.findOne({ dietitian: dietitianId });

    if (!treatment) {
      console.log("Creating new treatment document.");
      treatment = new Treatment({
        dietitian: dietitianId,
        clients: [],
      });
    }

    if (!treatment.clients) {
      treatment.clients = [];
    }

    let client = treatment.clients.find((c) => c.clientId.toString() === clientId);

    if (!client) {
      console.log("Adding new client.");
      client = {
        clientId,
        details: {},
        chat: [],
        treatmentPlan: { details: "" },
      };
      treatment.clients.push(client);
    }

    const clientIndex = treatment.clients.findIndex((c) => c.clientId.toString() === clientId);

    // ✅ Ensure treatment details update properly
    if (treatmentDetails && senderType === "dietitianmodel") {
      console.log("Updating treatment plan.");
      client.treatmentPlan.details = { ...treatmentDetails };
      client.treatmentPlan.updatedAt = new Date();
      treatment.markModified(`clients.${clientIndex}.treatmentPlan.details`); // Force update
    }

    // ✅ Ensure reassignment in the array
    treatment.clients[clientIndex] = client;

    await treatment.save();
    res.status(201).json({ message: "Treatment & chat updated successfully", treatment });

  } catch (error) {
    console.error("Error updating treatment:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




exports.getearningsdetails = async (req, res) => {
  try {
    // Extract the ID properly
    const { id } = req.params;


    // Convert to ObjectId
    const objectid = new mongoose.Types.ObjectId(id);

    // Query the database
    const response = await dietitianmodel.find({ dietitianId: objectid });

    if (!response || response.length === 0) {
      return res.status(404).json({ message: "No earnings found for this dietitian" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching earnings details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getclientreport = async (req, res) => {
  try {
    const { dietid, clientid } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(dietid) || !mongoose.Types.ObjectId.isValid(clientid)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Convert clientId to ObjectId
    const clientObjectId = new mongoose.Types.ObjectId(clientid);

    // Find treatments for the given dietitian
    const treatments = await Treatment.find({ dietitian: dietid });

    console.log("Fetched treatments:", JSON.stringify(treatments, null, 2));

    if (!treatments.length) {
      return res.status(404).json({ message: "No treatments found for this dietitian" });
    }

    // Filter clients whose clientId matches the provided clientid
    const result = treatments.flatMap((treatment) =>
      treatment.clients.filter((client) => client.clientId.equals(clientObjectId))
    );

    console.log("Filtered Clients:", JSON.stringify(result, null, 2));

    if (result.length === 0) {
      return res.status(404).json({ message: "No report found for this client" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching client report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
