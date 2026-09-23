require('dotenv').config();
const express = require('express');
const errorHandler=require('./middleware/errorMiddleware');
const { logToCloudWatch } = require('./utils/logger');

const app = express();
app.use(express.json());


// Routes import
const userRouter = require("./routes/userRoute");
const documentRouter = require("./routes/documentRoute");

app.use("/", userRouter);
app.use("/", documentRouter);
app.use(errorHandler);

app.listen(process.env.PORT,()=>{
    console.log(`server is runing on port ${process.env.PORT || 3004}`)
    logToCloudWatch(`INFO: Server started on port ${process.env.PORT || 3004}`);
});


