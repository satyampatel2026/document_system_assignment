const express=require("express");
const userRouter=express.Router();
const {createUser,getUserById}=require('../controllers/userController');

userRouter.post('/api/users',createUser);
userRouter.get('/api/users/:id',getUserById)

module.exports=userRouter;

