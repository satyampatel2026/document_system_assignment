const jwt=require('jsonwebtoken');

const protect=(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
       try{
        token=req.headers.authorization.split(' ')[1];
        const decoded=jwt.verify(token,process.env.JWT_SECRET || "sp");
        req.user=decoded;
        next();
       }catch(error){
        console.error('JWT Verification error',error.message);
        return res.status(401).json({error:"Not Authorised, token failed"});
       }
    }
    if(!token){
        return res.status(401).json({error:"Not Authorised, no token provided"})
    }
}
module.exports={protect};