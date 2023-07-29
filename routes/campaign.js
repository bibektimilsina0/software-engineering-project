const express=require('express')
const {getAllCampaign, createCampaign, getCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaign')
const authorization=require('../middleware/authentication')
const restrict=require('../middleware/admin-auth')
const router=express.Router()
const upload=require('../props/fileupload')


router.route('/').get(getAllCampaign).post(authorization,upload.single('img'),createCampaign)
router.route('/:id').get(getCampaign).post(authorization,restrict('admin'),updateCampaign).delete(authorization,restrict('admin'),deleteCampaign)

module.exports=router;

