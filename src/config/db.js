const mysql=require('mysql2');

const connection= mysql.createConnection({
    user:"root",
    password:"Satyam@5514",
    host:"localhost",
    database:"document_system",
    port:3306
})

connection.connect((err)=>{
    if(err){
        console.log("db not connected",err.message)
        return;
    }else{
        console.log("db connected")
    }
})

module.exports=connection;