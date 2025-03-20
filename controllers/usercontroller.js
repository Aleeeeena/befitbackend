
const users=require('../models/usermodel')
const jwt=require('jsonwebtoken')
const UserSubscription = require('../models/usersubscriptionmodel')
const Treatment = require('../models/treatmentmodel')
const ProfileModel = require('../models/profilemode')
const mongoose=require("mongoose")


exports.userregistercontroller=async(req,res)=>{



    const{username,password,email,role}=req.body


    console.log(username,password,email,role);


    try {
        
    const existinguser=await users.findOne({email})

        if (existinguser) {

            res.status(406).json("user already registeres")
            
        }


        else{

            const newuser= new users({username,password,email,role})

        await newuser.save()
            res.status(200).json("registered")
        }
    } catch (error) {


        res.status(401).json(error)
        
    }
    
}




exports.userlogincontroller=async(req,res)=>{

    console.log("inside userlogincontroller");
    

   try {


    const{email,password}=req.body


    const existinguser= await users.findOne({email,password})


    if (existinguser) {


        const token=jwt.sign({userid:existinguser._id},process.env.JWT_PASSWORD)

        res.status(200).json({user:existinguser,token})
        
    }
    else{
        res.status(404).json("invalid username or password")
    }
    
   } catch (error) {
    res.status(401).json(error)
    
   }
}




exports.getalldietitiansbyusercontroller=async(req,res)=>{



    try {


        const dietitians=await users.find({role:"dietitian",isApproved:true})

        if (dietitians) {

            res.status(200).json(dietitians)
            
        }
        else{
            res.status(201).json("no dietitians found")
        }
        
    } catch (error) {


        res.status(401).json(error)
        
        
    }
}




exports.getSubscribedDietitians = async (req, res) => {
    try {
      const {id} = req.params // Assuming `req.user.id` is set from authentication middleware
  
      // Find user's subscriptions and populate dietitian details
      const subscription = await UserSubscription.findOne({userId:id})
        .populate({
          path: "subscriptions.dietitianId",
          select: "username", // Select fields you want
        });
  
      if (!subscription) {
        return res.status(404).json({ message: "No subscriptions found" });
      }
  
      // Extract subscribed dietitians
      const dietitians = subscription.subscriptions.map(sub => sub.dietitianId);
  
      res.status(200).json({ dietitians });
    } catch (error) {
      console.error("Error fetching dietitians:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };



  //send data to detauils


// Function to add or update client details
exports.addOrUpdateClientDetails = async (req, res) => {
    try {
        const { dietitianId, clientId, age, purpose, weight, height, todayMealIntake } = req.body;

        // Validate request body
        if (!dietitianId || !clientId) {
            return res.status(400).json({ message: "Dietitian ID and Client ID are required" });
        }

        // Find the treatment document associated with the dietitian
        let treatment = await Treatment.findOne({ dietitian: dietitianId });

        if (!treatment) {
            // Create a new treatment document if none exists for the dietitian
            treatment = new Treatment({
                dietitian: dietitianId,
                clients: []
            });
        }

        // Check if the client already exists in the treatment record
        const existingClientIndex = treatment.clients.findIndex(client => client.clientId.toString() === clientId);

        if (existingClientIndex !== -1) {
            // Update existing client details
            treatment.clients[existingClientIndex].details = {
                age,
                purpose,
                weight,
                height,
                todayMealIntake
            };
        } else {
            // Add new client entry
            treatment.clients.push({
                clientId,
                details: {
                    age,
                    purpose,
                    weight,
                    height,
                    todayMealIntake
                }
            });
        }

        // Save the treatment document
        await treatment.save();

        res.status(200).json({ message: "Client details updated successfully", treatment });
    } catch (error) {
        console.error("Error updating client details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// Get treatment details for a specific client and dietitian
exports.getTreatmentByClientAndDietitian = async (req, res) => {
    try {
        const { clientid, dietid } = req.params;

        // Fetch the treatment data for the specific dietitian
        const treatment = await Treatment.findOne({
            dietitian: dietid,
            "clients.clientId": clientid, // Ensuring client exists in the treatment plan
        });

        if (!treatment) {
            return res.status(404).json({
                success: false,
                message: "No treatment found for this client and dietitian",
            });
        }

        // Find the specific client details
        const clientData = treatment.clients.find(client => client.clientId.toString() === clientid);

        if (!clientData) {
            return res.status(404).json({
                success: false,
                message: "Client not found in the treatment plan",
            });
        }

        // Respond with the specific client's details and treatment plan
        res.status(200).json({
            success: true,
            clientDetails: {
                clientId: clientData.clientId,
                details: clientData.details, // Age, weight, height, purpose, etc.
                treatmentPlan: clientData.treatmentPlan, // Meal plan, water intake, etc.
            },
        });

    } catch (error) {
        console.error("❌ Error fetching treatment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching treatment",
            error: error.message,
        });
    }
};


exports.storeUserProfile = async (req, res) => {
    try {
        const { name, age, height, weight, email, userId } = req.body;
        const dp = req.file ? req.file.path : null;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Upsert profile (update if exists, create if not)
        const updatedProfile = await ProfileModel.findOneAndUpdate(
            { userId }, // Find by userId
            { $set: { name, height, weight, age, email, dp } }, // Update fields
            { new: true, upsert: true } // Return updated document & create if not exists
        );

        res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




exports.getprofile = async (req, res) => {
    try {
        const {userId } = req.params;

        // const clientObjectId = new mongoose.Types.ObjectId(userId);
  

       const result=await ProfileModel.findOne({userId:userId})
      

       if (result) {
        res.status(200).json(result);
        
       }

       else{
        res.status(200).json({message:"profile not updated"});
       }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};