const {Forbidden}=require('../errors')
const restrict=(Role)=>{
    return(req,res,next)=>{
        // console.log(req.user)
        if(req.user.role!==Role){
            throw new Forbidden('You do not have permission to perform this task')
        }
        next()
    }
}
module.exports=restrict;