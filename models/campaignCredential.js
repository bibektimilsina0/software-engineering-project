const mongoose=require('mongoose')

const CredentialSchema=new mongoose.Schema({
        Name:{
            type:String,
            required:[true,'provide name']
        },
        DOB:{
            type:Date,
            required:[true,'provide date of birth']
        },
        CampaignId:{
            type: mongoose.Types.ObjectId,
        ref: 'campaign',
        required: [true, 'please provide campaign id'],
        },
        Age:{
            type:String,
            required:[true,'provide Age']
        },
        documentType:{
            type:String,
            enum:["Birth Certificate","Citizenship","Driving License"]
        },
        document:[{
            data: Buffer,
            contentType: String
        }]


})
module.exports=mongoose.model('Credential',CredentialSchema)