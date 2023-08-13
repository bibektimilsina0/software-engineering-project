const Token = require('../models/tokenSchema')

const cron=require('node-cron')

const token_delete=cron.schedule('*/1 * * * *',async ()=>{
    const dates=new Date();

    try{
        const expiredToken=await Token.find({expiresAt: { $lte: dates}
    })
    
    for (const token of expiredToken) {
      await Token.findByIdAndDelete(token._id);
    }
    console.log(expiredToken)
    }
    catch(err){
        console.log(err)
    }
    },{
        scheduled: false
      })
// Explicitly start the task
token_delete.start();
module.exports={
    token_delete
}