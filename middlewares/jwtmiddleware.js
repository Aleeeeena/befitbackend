const jwt=require('jsonwebtoken')

const jwtmiddleware=(req,res,next)=>{


    console.log("inside jwt middle");


    const token=req.headers["authorization"].split(" ")[1]
    if (token) {
        //verify

        try {
            

          const jwtresponse=  jwt.verify(token,process.env.JWT_PASSWORD)
          console.log(jwtresponse);

          req.userid=jwtresponse.userid
          
        } catch (error) {

            res.status(401).json("autho failed ....please login")
            
        }
    }
    else{
res.status(404).json("authorization failed token is  misiing")
    }
    next()
    
}

module.exports=jwtmiddleware