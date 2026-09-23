const multer=require("multer");
const storage= multer.memoryStorage();

const fileFilter=(req,file,cb)=>{
    const allowedTypes= [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    if(allowedTypes.includes(file.mimetype)){
        cb(null,true)
    }else{
        cb(new Error("only jpeg,pdf and png are allowed"),false)
    }
};

const upload=multer({
    storage:storage,
    limits:{
        fileSize: 5*1024*1024,
    },
    fileFilter:fileFilter
});

module.exports=upload;