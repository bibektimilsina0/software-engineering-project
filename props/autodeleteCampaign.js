const Campaign = require('../models/campaign')

const cron=require('node-cron')

const task_delete=cron.schedule('0 * * * *',async ()=>{
    const dates=new Date();

    try{
        const expiredCampaigns=await Campaign.find({expiresAt: { $lte: dates}
    })
    
    for (const campaign of expiredCampaigns) {
      await Campaign.findByIdAndDelete(campaign._id);
    }

    }
    catch(err){
        console.log(err)
    }
    },{
        scheduled: false
      })
// Explicitly start the task
task_delete.start();
module.exports={
    task_delete
}
