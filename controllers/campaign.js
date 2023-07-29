const User=require('../models/user')
const { BadRequestError ,NotFoundError} = require('../errors')
const Campaign=require('../models/campaign')
const {StatusCodes}=require('http-status-codes')
const fs=require('fs')
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
 const user=await User.findOne({_id:req.body.createdBy})
 const creatorName=user.name;
 const fundsNeeded=req.body.goal;
 const fundsRaised=0;
 console.log(req.file)
 if (!req.file) {
    throw new  BadRequestError('No File Uploaded');
  }
  const productImage = req.file;
  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError('Please Upload Image');
  }
  const maxSize = 3*1024 * 1024;
  if (productImage.size > maxSize) {
    throw new BadRequestError('Please upload image smaller 3MB');
  }
    const campaign= await Campaign.create({...req.body,creatorName:creatorName,fundsNeeded:fundsNeeded,fundsRaised:fundsRaised ,   img: {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType:req.file.mimetype
    }})
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
        body:{title,story,goal,category, FundraisingPeriod,status},
        params:{id:campaignId},
        user:{userId}}=req
        if(title===''||story===""||goal===""||category===""||FundraisingPeriod===""||status==""){
            throw new BadRequestError('title,story,category,goal,fundraisingPeriod and stauts fields cannot be empty')
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