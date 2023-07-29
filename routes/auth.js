const express=require('express')
const router=express.Router()
const {register,login,forgotPassword,resetPassword}=require('../controllers/auth')

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:token').patch(resetPassword)
module.exports=router;