const express=require('express')
const {getAllCampaign, createCampaign, getCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaign')
const authorization=require('../middleware/authentication')
const restrict=require('../middleware/admin-auth')
const router=express.Router()


router.route('/').get(getAllCampaign).post(authorization,createCampaign)
router.route('/:id').get(getCampaign).post(authorization,restrict('admin'),updateCampaign).delete(authorization,restrict('admin'),deleteCampaign)

module.exports=router;

