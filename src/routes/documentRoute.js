const express=require("express");
const documentRouter= express.Router();
const {uploadDocument,getUserDocuments,getDocumentById,deleteDocument}=require('../controllers/documentController');
const upload=require('../middleware/uploadMiddleware');
const {protect}=require('../middleware/authMiddleware');
documentRouter.use(protect)

documentRouter.post('/api/documents/upload',upload.single("document"),uploadDocument);
documentRouter.get('/api/documents/user/:userId',getUserDocuments);
documentRouter.get('/api/documents/:id',getDocumentById)
documentRouter.delete('/api/documents/:id',deleteDocument)

module.exports=documentRouter;