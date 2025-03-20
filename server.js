const express =require('express');
const cors = require('cors');
const mongoose=require('mongoose')
require('dotenv').config();
const router=require('./routes/routes')

const server = express();
server.use(cors());
server.use(express.json());

server.use(router)
server.use('/certificates',express.static('./certificates'))
server.use('/profiles',express.static('./profiles'))




const PORT = 3000 || process.env.PORT;

server.get('/', (req, res) => {
    res.send(`Server connected on port ${PORT}`);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


mongoose.connect(process.env.MONGO).then(()=>{console.log("mongo atlas connected successfully");


}).catch((error)=>console.log(error)
)



