const sendEmail=require('../props/sendEmail')
const User=require('../models/user')
const crypto=require('crypto')
const {StatusCodes}=require('http-status-codes')
const {BadRequestError, UnauthenticatedError,NotFoundError}=require('../errors')
const register=async(req,res)=>{
     const {password,confirmPassword}=req.body

     if(!(password===confirmPassword)){
      return  res.status(400).json('password and confirmPassword must be same')
     } 
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
   const{email}=req.body;
    const user= await User.findOne({email})
    if(!user){
        throw new NotFoundError(`user with email:${req.body.email} is not found`)
    }
    const resetToken= await user.createResetToken();
    console.log(resetToken)
   await user.save({ValidateBeforeSave: false});
   //send email
   const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
   const message=`We have received a password reset request. Please ues below link to reset your password\n\n${resetUrl}`;
   console.log(message)
   try {
    await sendEmail({
        email:user.email,
        message:message,
        subject:'Password Reset Code'
       })
        res.status(200).json({
            status:'success',
            message:'password reset link send to user email'
        })
   } catch (error) {
     user.forgotpassToken=undefined;
     user.forgotTokenExpires=undefined;
     user.save({ValidateBeforeSave:false})
     return new NotFoundError('There was a error sending password reset email.');
   }
  
}
const resetPassword=async(req,res)=>{
    const {password,confirmPassword}=req.body
    const forgotToken=await crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({forgotpassToken:forgotToken,forgotTokenExpires:{$gt:Date.now()}});
    if(!user){
        throw new BadRequestError('token is invalid or expired')
    }
    if(!password||!confirmPassword){
      return  res.json('there must be new password and confirm new password')
    }
    if(!(password===confirmPassword)){
        return  res.status(400).json('password and confirmPassword must be same')
       }
    user.password=req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    user.forgotTokenExpires=undefined;
    user.forgotpassToken=undefined;
    user.passwordChangedAt=Date.now();
    user.save()
    const token=await user.createJWT()
    res.status(StatusCodes.CREATED).json({user:{name:user.name},token})
  
}
module.exports={
    register,login,forgotPassword,resetPassword
}