const sendEmail=require('../props/sendEmail')
const User=require('../models/user')
const crypto=require('crypto')
const VerifyToken=require('../models/tokenSchema')
const {StatusCodes}=require('http-status-codes')
const {BadRequestError, UnauthenticatedError,NotFoundError}=require('../errors')
const register=async(req,res)=>{
     const {password,confirmPassword}=req.body

     if(!(password===confirmPassword)){
      return  res.status(400).json('password and confirmPassword must be same')
     } 
        const user=await User.create({...req.body})
        const token=await user.createJWT()

        const verifyToken = await new VerifyToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex")
        }).save()
        const verificationLink = `${req.protocol}://${req.get('host')}/api/v1/auth/verify/${verifyToken.userId}/${verifyToken.token}`
        const message = `<!DOCTYPE html>
        <html>
        <head>
          <title>Verify Your Email Address - Crowd Funding Services</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify Your Email Address - Crowd Funding Services</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for joining Crowd Funding Services! We are thrilled to have you as a part of our community. Before we get started, we need to verify your email address to ensure the security of your account.</p>
          <p>To complete the verification process, simply click on the link below:</p>
          <p><a href="${verificationLink}">Verify Your Email Address</a></p>
          <p>If the link above does not work, you can copy and paste the following URL into your browser:</p>
          <p>${verificationLink}</p>
          <p>Please note that this link will expire after [time period], so make sure to verify your email address as soon as possible.</p>
          <p>By verifying your email, you'll gain full access to our platform and receive updates on exciting crowdfunding opportunities tailored to your interests.</p>
          <p>If you did not sign up for an account with Crowd Funding Services, or if you have any questions or concerns, please contact our support team at [support email or phone number].</p>
          <p>Thank you for choosing Crowd Funding Services. We look forward to helping you bring your dreams to life!</p>
          <b><p>Best regards,<br>The Crowd Funding Services Team</p></b>
        </body>
        </html>`
        try {
            await sendEmail({
                email:user.email,
                message:message,
                subject:'Email Verification'
               })
                res.status(200).json({
                    status:'success',
                    message:'verification link sent successfully'
                })
           } catch (error) {
            
             user.save({ValidateBeforeSave:false})
             return new NotFoundError('There was a error sending password reset email.');
           }
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

const verifyEmail = async (req, res, next) => {
    try {
        const { id, token } = req.params
        const user = await VerifyToken.findOne({ userId: id })
        if (!user) {
            return res.status(404).json({
                message: "Wrong Verification Link"
            })
        }
        if (user.expiresAt < Date.now()) {
            await VerifyToken.findOneAndDelete({ userId: id })
            return res.status(404).json({
                message: 'Link Expired'
            })
        }

        // update the user and verify email
        await User.findOneAndUpdate({ _id: user.userId }, { $set: { verified: true } })

        // delete the token for this user after verification 
        await VerifyToken.findOneAndDelete({ userId: id })
        
        res.status(200).json({
            message: 'User verified'
        })

    } catch (error) {
        next(error)
    }

}


module.exports={
    register,login,forgotPassword,resetPassword,verifyEmail
}