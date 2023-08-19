require('dotenv').config()
require('express-async-errors');
const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const authRoute=require('./routes/auth')
const campaignRoute=require('./routes/campaign')
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const cors=require('cors')
const helmet = require('helmet');
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false}))

const connectDb = require('./db/connect')
app.use(cors())
app.use(helmet());
const task_delete=require('./props/autodeleteCampaign')
const token_delete=require('./props/autodeleteToken')
app.use('/api/v1/auth',authRoute)
app.use('/api/v1',campaignRoute)
app.get('/',(req,res)=>{
    res.send('bibektimilsina')
})
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port=process.env.PORT||3000;
const start=async()=>{
try {
   await connectDb(process.env.MONGO_URL)
   app.listen(port,(req,res)=>{
    console.log("listening on port",port);
   
})
} catch (error) {
    console.log(error);
    
}
}
start()