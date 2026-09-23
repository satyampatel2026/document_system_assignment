const {PutObjectCommand,DeleteObjectCommand,GetObjectCommand}=require("@aws-sdk/client-s3");
const {getSignedUrl}=require('@aws-sdk/s3-request-presigner');
const s3Client=require('../config/awsConfig');

const generatePresignedUrl=async(key)=>{
    const command=new GetObjectCommand({
        Bucket:process.env.AWS_S3_BUCKET,
        Key:key,
    })
    const url=await getSignedUrl(s3Client,command,{expiresIn:3600});
    return url;
}
const uploadToS3=async(file,userId)=>{
    const key= `documents/user-${userId}/${file.originalname}`;
    await s3Client.send( new PutObjectCommand({
        Bucket:process.env.AWS_S3_BUCKET,
        Key:key,
        Body:file.buffer,
        ContentType:file.mimetype
    })
   )
   const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
   return {key, s3Url};
}

const deleteFromS3=async(key)=>{
    await s3Client.send(new DeleteObjectCommand({
        Bucket:process.env.AWS_S3_BUCKET,
        Key:key
    }))
}   

module.exports={uploadToS3,deleteFromS3,generatePresignedUrl};
