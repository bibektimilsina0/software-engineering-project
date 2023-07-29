const multer=require('multer')
var storage=multer.diskStorage({
    destination:function(req,file,cd){
cd(null,'./uploads')
    },
    filename:function(req,file,cd){
        cd(null,`${Date.now()}-${file.originalname}`)
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

const upload = multer({ storage: storage })
// return upload


module.exports=upload;
