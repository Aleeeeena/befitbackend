
const subscription = require('../models/subscriptionmodel');
const users = require('../models/usermodel');
const subscribers=require('../models/usersubscriptionmodel')
const dietitiansbscriptionmodel=require('../models/dietitiansubscriptionmodel')
const mongoose=require('mongoose')
exports.getalluserscontroller=async(req,res)=>{


    console.log("inside allusers admin controller");


    try {
        
        const allusers=await users.find({role:"user"})

        res.status(200).json(allusers)
    } catch (error) {

        res.status(401).json(error)
    }
    


    


}

//deletecontroller




  exports.deleteusercontroller=async(req,res)=>{

    console.log("indise dlt contoller");

    const {id}=req.params

   

    try {


        const deleted=await users.findByIdAndDelete({_id:id})
       
        res.status(200).json(deleted)
         
     } catch (error) {
         res.status(401).json(error)
         
     }
    

}




//getalldietitians












exports.getallunapproveddietitianscontroller = async (req, res) => {
    console.log("Inside unapproved dietitian admin controller");

    try {
        const allunapproveddietitians = await users.find({
            role: "dietitian",
            isApproved: false
        });

        // Convert dietitian objects and update certificate URL
        const updatedDietitians = allunapproveddietitians.map((dietitian) => {
            return {
                ...dietitian.toObject(),
                certificateUrl: dietitian.certificate
                    ? `http://localhost:3000/${dietitian.certificate.replace(/\\/g, "/")}`
                    : null
            };
        });

        res.status(200).json({ dietitians: updatedDietitians });
    } catch (error) {
        console.error("Error fetching unapproved dietitians:", error);
        res.status(500).json({ error: "Failed to fetch dietitians" });
    }
};


exports.approvedietitiancontroller=async(req,res)=>{


    const {id}=req.params

  

 const approved=true
const{username,email,password,role,certificate,specialization,isApproved,createdAt,updatedAt}=req.body
    
    try {
    
        const result=await users.findByIdAndUpdate({_id:id},{username,email,password,role,certificate,specialization,isApproved:approved,createdAt,updatedAt}, { new: true })
        await  result.save()
        res.status(200).json(result)
        
    } catch (error) {
    
        res.status(500).json(error)
        
    }
    
    
    }


    exports.rejectdietitiancontroller=async(req,res)=>{


        const {id}=req.params
        try {

            const result=await users.findByIdAndDelete({_id:id})
         
            res.status(200).json(result)
            
        } catch (error) {

            res.status(401).json(error)
            
        }
    }



    //active dietitians
    exports.allactivedietitianscontroller=async(req,res)=>{


        try { 


            const active= await users.find({isApproved:true})

          if (active) {
            res.status(200).json(active)
            
          }
          else{
            res.status(201).json("no data found")
          }
            
        } catch (error) {

            res.status(401).json(error)
            
        }
    }


    //from subcription schema


    
    
    
    // Get total subscribers for each dietitian
    exports. getTotalSubscribersByDietitian = async (req, res) => {
        try {
            const dietitianSubscribers = await subscription.aggregate([
                { $unwind: "$dietitianIds" }, // Split dietitian array
                { 
                    $group: { 
                        _id: "$dietitianIds", 
                        totalSubscribers: { $sum: 1 } 
                    } 
                }, // Count total subscribers per dietitian
                {
                    $lookup: {
                        from: "users", 
                        localField: "_id", 
                        foreignField: "_id", 
                        as: "dietitianDetails"
                    }
                }, // Get dietitian details
                {
                    $project: {
                        dietitianId: "$_id",
                        dietitianName: { $arrayElemAt: ["$dietitianDetails.username", 0] }, 
                        totalSubscribers: 1,
                        _id: 0
                    }
                } // Format the response
            ]);
    
            res.status(200).json({ success: true, data: dietitianSubscribers });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    };
    
    
    exports.getallsubscribedusers=async(req,res)=>{

        try {
         
          
         const allsubscribers=await subscribers.find() .populate({
            path: "userId", // Reference to User model
            select: "username email"
        })
        .populate({
            path: "subscriptions.dietitianId", // Reference to Dietitian model
            select: "username email"
        })
        .lean();

        

         res.status(200).json(allsubscribers)
            
        } catch (error) {
            res.status(400).json(error)
            
        }
    }



    exports.getalldietitiansubs=async(req,res)=>{

        const {dietitianId}=req.params

        try {


            const result=await dietitiansbscriptionmodel.find({dietitianId})

           res.status(200).json(result)
            
        } catch (error) {


            res.status(400).json(error)
            
            
        }
    }


    exports.pendingToDone = async (req, res) => {
        try {
            const { dietitianId } = req.params;
            console.log("Received Dietitian ID:", dietitianId); // Debugging line
    
            // Trim extra spaces or line breaks
            const cleanDietitianId = dietitianId.trim();
    
            // Validate the ObjectId format
            if (!mongoose.Types.ObjectId.isValid(cleanDietitianId)) {
                return res.status(400).json({ error: "Invalid Dietitian ID format" });
            }
    
            const updatedSubscription = await dietitiansbscriptionmodel.findOneAndUpdate(
                { dietitianId: cleanDietitianId }, // Search by dietitianId
                { paymentStatus: "completed" },
                { new: true }
            );
    
            if (!updatedSubscription) {
                return res.status(404).json({ error: "Subscription not found for this Dietitian ID" });
            }
    
            res.status(200).json({ message: "Payment status updated successfully", updatedSubscription });
    
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    };
    

    //remove dietitian
    exports.removedietitiancontroller=async(req,res)=>{


        const {id}=req.params
        try {
            
            await subscribers.updateMany(
                { "subscriptions.dietitianId": id },
                { $pull: { subscriptions: { dietitianId: id } } } // Remove dietitian subscriptions from users
            );
            await subscribers.deleteMany({ subscriptions: { $size: 0 } });
            // Step 2: Delete dietitian subscription entry (if exists)
            await dietitiansbscriptionmodel.findOneAndDelete({ dietitianId: id });
    
            const result=await users.findByIdAndDelete({_id:id})
         
            res.status(200).json(result)
            
        } catch (error) {

            res.status(401).json(error)
            
        }
    }

//payment page fetch


exports.getallpaymentdetails=async(req,res)=>{
    try {
        
        const result=await dietitiansbscriptionmodel.find()

        res.status(200).json(result)
    } catch (error) {

        res.status(400).json(error)
        
    }
}