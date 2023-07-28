const mongoose=require('mongoose')

const campaignSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please provide campaign name."]
    },
    story:{
        type:String,
        required:[true,"Please provide story or short Description. "]
    },
    goal:{
        type:Number,
        required:[true,"Please provide Campaign goal."]
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: [true, 'please provide user'],
      },
    status:{
        type:String,
        enum:['Pending','Approved'],
        default:'Pending',
    }
})
module.exports=mongoose.model('Campaign',campaignSchema)