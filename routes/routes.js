const express=require('express')
const { userregistercontroller, userlogincontroller, getalldietitiansbyusercontroller, getSubscribedDietitians, addOrUpdateClientDetails, getAllTreatments, getTreatmentByClientAndDietitian, storeUserProfile, getprofile } = require('../controllers/usercontroller')
const multermiddleware = require('../middlewares/multer')
const { dietitianregistercontroller, getAllClients, addOrUpdateTreatment, getearningsdetails, getclientreport } = require('../controllers/dietiancontoller')
const jwtmiddleware = require('../middlewares/jwtmiddleware')
const { getalluserscontroller, deleteusercontroller,
     getallunapproveddietitianscontroller, approvedietitiancontroller, rejectdietitiancontroller, allactivedietitianscontroller, 
     getTotalSubscribersByDietitian,
     getallsubscribedusers,
     getalldietitiansubs,
     pendingToDone,
     removedietitiancontroller,
     getallpaymentdetails} = require('../controllers/admincontroller')
const { createPayment, successPayment, cancelPayment } = require('../controllers/paymentcontroller')
const paypal=require('paypal-rest-sdk')
const { getChat, sendMessage } = require('../controllers/chatcontroller')
const multer = require('multer')







const router= new express.Router()


router.post('/register-user',userregistercontroller)
router.post('/register-dietitian',multermiddleware.single("certificate"),dietitianregistercontroller)
router.post('/login',userlogincontroller)
router.get('/getalluser/admin',getalluserscontroller)
router.delete('/admin/delete/:id',deleteusercontroller)
router.get('/getallunapproveddietitians/admin',getallunapproveddietitianscontroller)
router.put('/dietitian/approve/:id',approvedietitiancontroller );
router.delete('/reject/approval/:id',rejectdietitiancontroller)
router.get('/getallactivedietitians',allactivedietitianscontroller)
router.get('/all',getTotalSubscribersByDietitian)
router.get('/alldietitians/user',getalldietitiansbyusercontroller)


//router.post('/create', createPayment);
router.post("/create", async (req, res) => {
     try {
         const { userId, dietitianId, amount } = req.body;
 
         const create_payment_json = {
             intent: "sale",
             payer: { payment_method: "paypal" },
             redirect_urls: {
                 return_url: `https://befitfitness.vercel.app/success`, // No need to pass dietitianId in URL
                 cancel_url: "https://befitfitness.vercel.app/cancel",
             },
             transactions: [
                 {
                     amount: { currency: "USD", total: amount },
                     description: `Subscription payment for dietitian ${dietitianId}`,
                     custom: JSON.stringify({ userId, dietitianId }) // Store userId & dietitianId
                 },
             ],
         };
 
         paypal.payment.create(create_payment_json, (error, payment) => {
             if (error) {
                 console.log(error);
                 res.status(500).json({ error: "Payment creation failed" });
             } else {
                 const forwardLink = payment.links.find((link) => link.rel === "approval_url").href;
                 res.json({ forwardLink });
             }
         });
     } catch (error) {
         res.status(500).json({ error: "Something went wrong" });
     }
 });
 

router.get('/success', successPayment);
router.get('/cancel', cancelPayment);


router.get('/getallsubscribedusers',getallsubscribedusers)
router.get('/getalldietitiansubscribers/:dietitianId',getalldietitiansubs)

router.put('/pendingtodone/:dietitianId',pendingToDone)

router.delete('/removedietitian/:id',removedietitiancontroller)

router.get('/paymentpage',getallpaymentdetails)
router.get('/allclients/:id',getAllClients)

router.post('/treatment',addOrUpdateTreatment)

router.get('/getmydietitians/:id',getSubscribedDietitians)
router.post('/postdetails',addOrUpdateClientDetails)
router.get('/getsuggestion/:clientid/:dietid',getTreatmentByClientAndDietitian)



router.get("/api/chat/:dietitianId/:clientId",getChat);
router.post("/api/chat/:dietitianId/:clientId",sendMessage);

router.get('/earningdetails/:id',getearningsdetails)

router.get('/clientreport/:dietid/:clientid',getclientreport)
router.post('/profile', multermiddleware.single('profileImage'), storeUserProfile);

router.get('/getprofiledetails/:userId',getprofile)



module.exports = router; 













