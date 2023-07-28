require('dotenv').config()
const jwt=require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth=async(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith('Bearer ')){
        throw new UnauthenticatedError('Not authorized')
    }
     const token=authHeader.split(' ')[1]
     try {
        const payLoad=jwt.verify(token,process.env.JWT_SECRET)
        req.user={userId:payLoad.userId,name:payLoad.name,role:payLoad.role}
        console.log(`req.user`)
        next()
     } catch (error) {
        throw new UnauthenticatedError('Not Authorized')
     }
}
module.exports=auth;
