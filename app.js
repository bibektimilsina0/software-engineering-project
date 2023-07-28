require('dotenv').config()
require('express-async-errors');
const express=require('express')
const app=express()

const authRoute=require('./routes/auth')
const campaignRoute=require('./routes/campaign')
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const cors=require('cors')
app.use(express.json())

const connectDb = require('./db/connect')
app.use(cors())
app.use('/api/v1/auth',authRoute)
app.use('/api/v1/campaign',campaignRoute)
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