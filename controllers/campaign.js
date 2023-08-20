const User=require('../models/user')
const {UnauthenticatedError, BadRequestError ,NotFoundError} = require('../errors')
const Campaign=require('../models/campaign')
const Credential=require('../models/campaignCredential')
const {StatusCodes}=require('http-status-codes')
const fs=require('fs')
const path=require('path')
// const {uploadToS3}=require('../props/awsupload')
// const {getFromS3}=require('../props/awsupload')
const getAllCampaign=async(req,res)=>{
    const{name,creator,progress,category,sort}=req.query;
    // let result=await Campaign.find({status:'Approved'})
    let queryObject={status:'Approved'};
    const validCategories=['Child','Girls','Animal','Envirnoment','Disability','Patient','Education']
    if(name){
        queryObject.title={$regex:name,$options:'i'}
    }
    if(creator){
        queryObject.creatorName={$regex:creator,$options:'i'}
    }
    if(category&&validCategories.includes(category)){
        queryObject.category=category
    }
    if(progress){
        queryObject.progress=progress
    }
   let result=await Campaign.find(queryObject)

    // if (sort) {
    //     const sortList = sort.split(',').join(' ');
    //     result = result.sort({sortList});
    //   } else {
    //     result = result.sort({ createdAt: 1 });
    //   }
    // const filteredcampaign=await result;
    const filteredCampaign = await Promise.all(result.map(async campaign => {
        const base64String = campaign.img.data.toString('base64');
        return {
          ...campaign.toObject(), // Include all existing properties
          img: base64String, // Modify the img property
        };
      }));
    res.status(StatusCodes.OK).json({filteredCampaign,count:filteredCampaign.length})
}
const getPendingCampaign=async(req,res)=>{
    const{name,creator,progress,category}=req.query;
    // let result=await Campaign.find({status:'Approved'})
    let queryObject={status:'Pending'};
    const validCategories=['Child','Girls','Animal','Envirnoment','Disability','Patient','Education']
    if(name){
        queryObject.title={$regex:name,$options:'i'}
    }
    if(creator){
        queryObject.creatorName={$regex:creator,$options:'i'}
    }
    if(category&&validCategories.includes(category)){
        queryObject.category=category
    }
    if(progress){
        queryObject.progress=progress
    }
   let result=await Campaign.find(queryObject)

    const filteredCampaign = await Promise.all(result.map(async campaign => {
        // const base64String = campaign.img.data.toString('base64');
        return {
          ...campaign.toObject(), 
        };
      }));
    res.status(StatusCodes.OK).json({filteredCampaign,count:filteredCampaign.length})
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
 if(!user.verified){
    throw new UnauthenticatedError('You must verify your email to create campaign')
 }
 const expiresAt=Date.now()+86400000*req.body.FundraisingPeriod;
 console.log(expiresAt)
 const creatorName=user.name;
 const fundsNeeded=req.body.goal;
 const fundsRaised=0;

 
 if (!req.file) {
    throw new  BadRequestError('No File Uploaded');
  }
  const productImage = req.file;
  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError('Please Upload Image');
  }
  const maxSize = 500*1024;
  if (productImage.size > maxSize) {
    throw new BadRequestError('Please upload image smaller 500kb');
  }
  
    const campaign= await Campaign.create({...req.body,creatorName:creatorName,fundsNeeded:fundsNeeded,fundsRaised:fundsRaised ,expiresAt,   img: {
        data:req.file.buffer,
        contentType:req.file.mimetype
    }})
    const postCrediential=`${req.protocol}://${req.get('host')}/api/v1/campaign/${campaign._id}/credentials`;
    res.status(StatusCodes.OK).json({campaign:campaign,message:`You need further verification to approve Campaign.To complete the verification process, simply click on the link below:\n\n ${postCrediential}`})
}

const deleteCampaign=async(req,res)=>{
    const {params:{id:campaignId},user:{userId}}=req
    const campaign=await Campaign.findOneAndDelete({
        _id:campaignId
    })
    if(!campaign){
        throw new NotFoundError(`No campaign with id ${campaignId}`)
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
const credential=async(req,res)=>{
    const{Name,DOB,Age,documentType}=req.body;
    req.body.CampaignId =req.params.id
    console.log(req.files)
    console.log( req.body.CampaignId);
 
    const campaigncredential=await Credential.create(
       { Name:Name,
        DOB:DOB,
        Age:Age,
        documentType:documentType,
        CampaignId:req.body.CampaignId
        }
    ) 
   
   const files = req.files;
    const images = [];

    for (const file of files) {
        if (!file.mimetype.startsWith('image')) {
            throw new BadRequestError('Please Upload Image');
          }
        if(file.size>=100*1024){
            throw new BadRequestError('Please upload image smaller 100kb');
        }
      const newImage ={
        data: file.buffer,
        contentType: file.mimetype
      };
    //   images.push(newImage)
      campaigncredential.document.push(await newImage);
    }
   campaigncredential.save()

    res.status(StatusCodes.CREATED).json({credential:campaigncredential})  
  

}
const getCredential=async(req,res)=>{
    const CampaignId =req.params.id
    const campaignCredential=await Credential.find({CampaignId:CampaignId})
    res.status(StatusCodes.OK).json({credential:campaignCredential})  
  
}
module.exports={
    getAllCampaign,getCampaign,createCampaign,updateCampaign,deleteCampaign,credential,getPendingCampaign,getCredential
}