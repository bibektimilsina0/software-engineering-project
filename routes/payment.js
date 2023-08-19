const express=require('express')
const authorization=require('../middleware/authentication')
const router=express.Router()
const {getpayment,onSuccess} =require('../controllers/payment')
router.route('/:id/onsuccess').get(getpayment).patch(authorization,onSuccess)

module.exports=router;

