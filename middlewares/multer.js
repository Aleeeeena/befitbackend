const multer=require('multer')
const storage=multer.diskStorage({



    destination:(req,file,callback)=>{


        const folder = file.fieldname === "profileImage" ? "./profiles" : "./certificates";

        callback(null,folder)
    },

    filename:(req,file,callback)=>{


        callback(null,`certi-${Date.now()}-${file.originalname}`)
    }
})

const multermiddleware=multer({storage})
module.exports=multermiddleware