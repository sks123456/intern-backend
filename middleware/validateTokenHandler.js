const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async(req,res,next)=>{
    let token;
    let authHeader = req.headers.authorization|| req.headers.Authorization;
    // spliting the token from the bearer in the request header
    if (authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];
        //verify token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decoded)=>{
            if(err){
                res.status(401);
                throw new Error("User is not authorized");
            }
            req.user = decoded.user;
            next();
        });

        // wrong token or token missing
        if(!token){
            res.status(401);
            throw new Error("User is not authorized or token is missing");
        }
    }
});
module.exports = validateToken;