const mongoose=require('mongoose')
const  bcrypt=require('bcryptjs')
const crypto=require('crypto')
const jwt=require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Provide name'],
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Provide valid email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Provide password'],
        minlength: 5,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Provide password'],
        minlength: 5,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
    passwordChangedAt:Date,
    forgotpassToken:String,
    forgotTokenExpires:Date,
})
userSchema.pre('save',async function(next){
    const salt=await bcrypt.genSalt(10);
   this.password=await bcrypt.hash(this.password,salt)
   this.confirmPassword=this.password;
   next()
})
userSchema.methods.createJWT=function(){

    return jwt.sign({userId:this._id,name:this.name,role:this.role},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_LIFETIME,
    })


}
userSchema.methods.checkPassword=async function(proviededPassword){
 return await bcrypt.compare(proviededPassword,this.password)
}
userSchema.methods.createResetToken=async function(){
    const resetToken= await crypto.randomBytes(32).toString('hex');
   
   this.forgotpassToken= crypto.createHash('sha256').update(resetToken).digest('hex')
   this.forgotTokenExpires=Date.now()+10*60*1000;
   console.log(resetToken,this.forgotpassToken)
   return resetToken;
}


module.exports=mongoose.model('User',userSchema)