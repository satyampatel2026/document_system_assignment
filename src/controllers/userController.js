const connection=require("../config/db");
const jwt=require('jsonwebtoken');

const createUser= (req,res)=>{
  let {name,email}=req.body;
   if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required",
    });
  }
  let query= `insert into users set name=?, email=? ;`
  connection.query(query,[name,email],(err,result)=>{
    if(err){
        console.log("user err",err);
        return res.status(500).json({
            success:false,
            message:"failed to create user"
        });
    }
    res.status(200).json({
        success:true,
        message:"user create success",
        data:{id:result.insertId,
            name,email
        }
    })
  })
}

const getUserById=(req,res)=>{
    const {id} =req.params;
    let query= `select * from users where id=?`
    connection.query(query,[id],(err,result)=>{
        if(err){
            console.log("get user err",err)
            return res.status(500).json({
                success:false,
                message:"failed to get user"
            })
        }
        if(result.length===0){
        return res.status(404).json({
            success:false,
            message:"user not found"
        })
        }
        res.status(200).json({
            success:true,
            message:"user found success",
            data:result[0]
        })
    })


}

const generateToken=(userId,email)=>{
    return jwt.sign({userId,email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN || "1d"});
}

const loginUser = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required for login"
    });
  }

  let query = `SELECT * FROM users WHERE email = ?`;
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.log("login err", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error during login" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }

    const user = results[0];
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      userID: user.id
    });
  });
};
module.exports={createUser,getUserById,loginUser};