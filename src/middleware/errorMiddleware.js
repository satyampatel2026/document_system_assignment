const {putMetric}=require('../services/cloudwatch.service');
const {logToCloudWatch}=require('../utils/logger');

const errorHandler= async(err,req,res,next)=>{
 if(err.name==="MulterError" || err.message.includes("allowed") || err.message.includes("limit") ){
     console.log("upload validation failed",err.message);
     await logToCloudWatch(`ERROR: Document upload failed - ${err.message}`);
     await putMetric("DocumentUploadFailed")

     return res.status(400).json({
        success:false,
        message:err.message
     })
 }
 res.status(500).json({
    success:false,
    message:err.message || "Internal Server Error"
 })
}

module.exports=errorHandler;