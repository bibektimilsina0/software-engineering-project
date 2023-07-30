const express=require('express')
const router=express.Router()
const {register,login,forgotPassword,resetPassword,verifyEmail}=require('../controllers/auth')

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:token').patch(resetPassword)
router.route('/verify/:id/:token').get(verifyEmail)
module.exports=router;