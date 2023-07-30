const multer=require('multer')
const path=require('path')
const fs=require('fs')
var storage=multer.diskStorage({
    destination:function(req,file,cb){
        const campaignId=req.params.id;
        console.log(campaignId)
        const uploadPath = path.join(__dirname,'../','credentials', campaignId);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    },
    fileFilter:function(req,file,cb){
        if(
            file.mimetype=="image/jpg"||
            file.mimetype=="image/png"||
            file.mimetype=="image/jpeg"
        ){
            cb(null,true)
        }else{
            console.log('only jpg and png files are accepted');
            cb(null,false)
        }
    }
})

const uploadCredential = multer({ storage: storage })
// return upload


module.exports=uploadCredential;
