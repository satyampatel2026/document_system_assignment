const connection=require('../config/db');
const {uploadToS3,deleteFromS3,generatePresignedUrl}= require('../services/s3Service');
const {publishDocumentNotification}=require('../services/snsService');
const {putMetric}=require('../services/cloudwatch.service');
const { logToCloudWatch } = require("../utils/logger");


const uploadDocument=async(req,res)=>{
   try{
    const {userId}=req.body;

    if(!userId){
        return res.status(400).json({
            success:false,
            message:"userId is required"
        })
    }
    if(!req.file){
        return res.status(400).json({
            success:false,
            message:"document file is required"
        })
    }
    console.log(`Upload started - userId=${userId}, fileName=${req.file.originalname}` );
    await logToCloudWatch( `Upload started - userId=${userId}, fileName=${req.file.originalname}`);
    const s3Result=await uploadToS3(req.file,userId);
    console.log("s3 upload success")
     await logToCloudWatch(`S3 upload successful - userId=${userId}, fileName=${req.file.originalname}`);

    const query= `insert into documents(user_id, original_name, s3_key, s3_url, file_size, mime_type) values(?, ?, ?, ?, ?, ?)`;
    const values=[userId, req.file.originalname, s3Result.key, s3Result.s3Url, req.file.size, req.file.mimetype];
    const [result]=await connection.promise().query(query,values);
    console.log("db insert success")
    await logToCloudWatch( `Document metadata saved successfully - documentId=${result.insertId}`);
    await putMetric("DocumentsUploaded");
try{
  await publishDocumentNotification({
    userId:userId,
    documentId:result.insertId,
    fileName:req.file.originalname,
    s3Key:s3Result.key,
  })
  console.log("SNS notification sent success");
  await logToCloudWatch(`SNS notification sent successfully - documentId=${result.insertId}`);
  await putMetric("SNSNotificationsSent");
}catch(snsError){
  console.log("SNS notification failed",snsError.message)
  await logToCloudWatch(`SNS notification failed - ${snsError.message}`);
  await putMetric("SNSNotificationsFailed");
}
    res.status(200).json({
        success:true,
        message:"S3 Upload success",
        data:{
            userId:userId,
            originalName:req.file.originalname,
            s3Key:s3Result.key,
            s3Url:s3Result.s3Url,
            MimeType:req.file.mimetype,
            fileSize:req.file.size
        }
    })
}catch(error){
    console.log("s3 upload failed",error.message);
    await putMetric("DocumentsUploadFailed");
    return res.status(500).json({
        success:false,
        message:"document upload failed"
    })
}
  
}

const getUserDocuments=(req,res)=>{
    const {userId}=req.params;
    const query=`select * from documents where user_id=?`;
    connection.query(query,[userId],(err,result)=>{
        if(err){
     console.log("faled to get docs",err)
     return res.status(500).json({
        success:false,
        message:"failed to get docs"
     })
     }
     res.status(200).json({
        success:true,
        message:"docs fetched success",
        data:result
     })
    })
}

const getDocumentById=(req,res)=>{
    const {id}=req.params;
    const query=`select * from documents where id=? `;
    connection.query(query,[id],async(err,result)=>{
        if(err){
            console.log("failed to get documents",err)
            return res.status(500).json({
                success:false,
                message:"failed to get docs"
            })                
            }
            if(result.length===0){
                return res.status(404).json({
                    success:false,
                    message:"docs not found"
                })                
        }
        try{
          const document=result[0];
          const presignedUrl= await generatePresignedUrl(document.s3_key);
          res.status(200).json({
            success:true,
            message:"docs fetch success",
            data:{...document,presignedUrl:presignedUrl}
          })
        }catch(error){
        console.log("Presigned Url Error:",error.message);
        res.status(500).json({
            success:false,
            message:"failed to generate url"
        })
        }
    })
}

const deleteDocument=(req,res)=>{
    const {id}=req.params;
    const query=`select * from documents where id=? `;
    connection.query(query,[id],async(err,result)=>{
        if(err){
            return res.status(500).json({
                success:false,
                message:"failed to get docs"
            })
        }
        if(result.length===0){
         return res.status(404).json({
            success:false,
            message:"docs not found"
         })
        }
        const documents=result[0];
        try{
           await deleteFromS3(documents.s3_key);
           const deletQuery =`delete from documents where id=?`;
         connection.query(deletQuery,[id],(err)=>{
            if(err){
                console.log("delete from database err",err)
                return res.status(500).json({
                    success:false,
                    message:"s3 delete success but database docs delete  failed"
                })
            }
            return res.status(200).json({
                success:true,
                message:"delete docs sucess"
            })
         })
        }catch(error){
          console.log("s3 delete error",error.message)
          return res.status(500).json({
            success:false,
            message:"s3 docs delete failed"
          })
        }
    })
}

 module.exports={uploadDocument,getUserDocuments,getDocumentById, deleteDocument};