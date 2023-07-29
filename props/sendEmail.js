require('dotenv').config()
const nodemailer=require('nodemailer');

const sendEmail=(options)=>{
    return new Promise(async (resolve,reject)=>{
    //transporter
  
    const transporter=nodemailer.createTransport({
        service: 'gmail',
        // port:process.env.PORT;
        // port: 587,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASSWORD,
        }
    })
    const emailOptions={
        from:process.env.EMAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,

    }
    try {
        transporter.sendMail(emailOptions)
        resolve('email sent')
    } catch (error) {
        console.log(error)
        reject(error)
    }

    })
}
module.exports=sendEmail