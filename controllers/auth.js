
const User=require('../models/user')
const {StatusCodes}=require('http-status-codes')
const {BadRequestError, UnauthenticatedError,NotFoundError}=require('../errors')
const register=async(req,res)=>{
    
        const user=await User.create({...req.body})
        const token=await user.createJWT()
       res.status(StatusCodes.CREATED).json({user:{name:user.name},token})  
    
    
}
const login=async(req,res)=>{
    const{email ,password}=req.body
    if(!email||!password){
        throw new BadRequestError('Please provide email and password')
    }
    const user=await User.findOne({email})
    if(!user){
        throw new UnauthenticatedError('Unauthorized user')
    }
    const isCorrect=await user.checkPassword(password)
    if(!isCorrect){
        throw new UnauthenticatedError('Incorrect password')
    }
    const token=await user.createJWT()
    res.status(StatusCodes.CREATED).json({user:{name:user.name},token})
}
const forgotPassword=async(req,res)=>{
   
//     const user=User.findOne({email:req.body.email})
//     if(!user){
//         throw new NotFoundError(`user with email:${req.body.email} is not found`)
//     }
//     const resetToken= await User.createResetToken()
//    await User.save();
    res.json('forgot password')
}
const resetPassword=async(req,res)=>{
    res.json('reset password')
}
module.exports={
    register,login,forgotPassword,resetPassword
}