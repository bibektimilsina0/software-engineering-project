
const { BadRequestError ,NotFoundError} = require('../errors')
const Campaign=require('../models/campaign')
const {StatusCodes}=require('http-status-codes')
const getAllCampaign=async(req,res)=>{
    const campaigns=await Campaign.find({status:'Approved'})
    res.status(StatusCodes.OK).json({campaigns,count:campaigns.length})
}
const getCampaign=async(req,res)=>{
    const {params:{id:campaignId}}=req
    const campaign=await Campaign.findOne({
        _id:campaignId
    })
    if(!campaign){
        throw new NotFoundError(`No campaign with id ${campaignId}`)
    }
    res.status(StatusCodes.OK).json({campaign})
}
const createCampaign=async(req,res)=>{
    req.body.createdBy=req.user.userId;
    const campaign= await Campaign.create(req.body)
    res.status(StatusCodes.OK).json({campaign})
}

const deleteCampaign=async(req,res)=>{
    const {params:{id:campaignId},user:{userId}}=req
    const campaign=await Campaign.findOneAndDelete({
        _id:campaignId,createdBy:userId
    })
    if(!campaign){
        throw new NotFoundError(`No job with id ${campaignId}`)
    }
    res.status(StatusCodes.OK).json({campaign})
}
const updateCampaign=async(req,res)=>{
    const {
        body:{title,story,goal},
        params:{id:campaignId},
        user:{userId}}=req
        if(title===''||story===""||goal===""){
            throw new BadRequestError('title,story or goal fields cannot be empty')
        }
    const campaign=await Campaign.findOneAndUpdate({
        _id:campaignId
    },req.body,{new:true,runValidators:true})
    if(!campaign){
        throw new NotFoundError(`No job with id ${campaignId}`)
    }
    res.status(StatusCodes.OK).json({campaign})

}
module.exports={
    getAllCampaign,getCampaign,createCampaign,updateCampaign,deleteCampaign
}