import jwt from "jsonwebtoken"
import AppError from "../utils/appError.js"
import User from "../../DB/models/user.js"
/**
 * Middleware that check if token exsist
 * then decoded to token and chech if token be not valid(expir..)
 * find user with id exist inpayload of token 
 * 
 */
export const protect =async(req,res,next)=>{
    let token
    if(req.headers.authorization&&
        req.headers.authorization.startsWith("Bearer") 
    ){
        token =req.headers.authorization.split(" ")[1]
    }
    if(!token){
        return next(new AppError("you are not logged in",401))
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET)

    const user=await User.findById(decoded.id)
    if(!user){
        return next(new AppError("rhe user no longer exists",401))
    }
    req.user=user;// Attach user to request for later middleware/controllers
    next()
}