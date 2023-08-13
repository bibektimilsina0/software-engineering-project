const User=require('../models/user')
const {UnauthenticatedError, BadRequestError ,NotFoundError} = require('../errors')
const Campaign=require('../models/campaign')
const Credential=require('../models/campaignCredential')
const {StatusCodes}=require('http-status-codes')
const fs=require('fs')
const path=require('path')
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
    console.log(queryObject);
   let result=await Campaign.find(queryObject)

    // if (sort) {
    //     const sortList = sort.split(',').join(' ');
    //     result = result.sort({sortList});
    //   } else {
    //     result = result.sort({ createdAt: 1 });
    //   }
    const fileredcampaign=await result;
    
    res.status(StatusCodes.OK).json({fileredcampaign,count:fileredcampaign.length})
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
 console.log(req.file)
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
        data: fs.readFileSync(path.join(__dirname ,'../'+ '/uploads/' + req.file.filename)),
        contentType:req.file.mimetype
    }})
    const postCrediential=`${req.protocol}://${req.get('host')}/api/v1/campaign/${campaign._id}/credentials`;
    res.status(StatusCodes.OK).json({campaign:campaign,message:`You need further verification to approve Campaign.To complete the verification process, simply click on the link below:\n\n ${postCrediential}`})
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
   req.files.forEach((file)=>{
    if (!file.mimetype.startsWith('image')) {
        throw new BadRequestError('Please Upload Image');
      }
    if(file.size>=200*1024){
        throw new BadRequestError('Please upload image smaller 200kb');
    }
    campaigncredential.document.push({
        data: fs.readFileSync(path.join(__dirname ,'../'+ `/credentials/${req.body.CampaignId}/` + file.filename)),
        contentType:file.mimetype
    })
   })
   campaigncredential.save()

    res.status(StatusCodes.CREATED).json({credential:campaigncredential})  
  

}
module.exports={
    getAllCampaign,getCampaign,createCampaign,updateCampaign,deleteCampaign,credential
}