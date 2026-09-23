const {SNSClient,PublishCommand}=require('@aws-sdk/client-sns');

const sns= new SNSClient({
    region:process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})
const publishDocumentNotification=async(data)=>{
    const message={
        event:"DOCUMENT_UPLOADED",
        userId: data.userId,
        documentId:data.documentId,
        fileName:data.fileName,
        s3Key:data.s3Key,
        uploadedAt:new Date().toISOString()
    }
    const result= await sns.send(new PublishCommand({
        TopicArn:process.env.AWS_SNS_TOPIC_ARN,
        Subject:"Document uploaded successfully",
        Message:JSON.stringify(message)
    }) 
)
      return result;
}
module.exports={publishDocumentNotification};