const express=require('express')
const {getAllCampaign, createCampaign, getCampaign, updateCampaign, deleteCampaign,credential, getPendingCampaign,getCredential} = require('../controllers/campaign')
const authorization=require('../middleware/authentication')
const restrict=require('../middleware/admin-auth')
const router=express.Router()
const upload=require('../props/fileupload')
const uploadCredential=require('../props/credentialsUpload')

router.route('/campaign').get(getAllCampaign).post(authorization,upload.single('img'),createCampaign)
router.route('/campaign/:id').get(getCampaign).post(authorization,restrict('admin'),updateCampaign).delete(authorization,restrict('admin'),deleteCampaign)
router.route('/campaign/:id/credentials').get(getCredential).post(authorization,uploadCredential.array('document', 5),credential)
router.route('/pendingcampaign').get(getPendingCampaign)
module.exports=router;

