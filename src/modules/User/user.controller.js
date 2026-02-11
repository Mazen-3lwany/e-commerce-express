import User from "../../../DB/models/user.js"
import AppError from "../../utils/appError.js";
/**
 * @desc Get All Users Registered in System
 * @route GET /api/users
 * @access Private(Admin only)
 */
export const getAllUsers=async(req,res,next)=>{
    const page=req.query.page*1||1;
    const limit=req.query.limit*1||5;
    const skip=(page-1)*limit
    const users=await User.find()
        .select('-refreshTokens')
        .skip(skip)
        .limit(limit);
    if(users.length===0){
        return res.status(200).json({
            status:"success",
            message:"No User Rgistered Yet ",
            data:[]
        })
        }
        res.status(200).json({
            status:"success",
            message:"This All Users are Registered in System",
            results:users.length,
            page:page,
            data:users
        })
    
}
/**
 * @desc Get Specific USer Registered in System
 * @route GET /api/user/:id
 * @access Private(admin only)
 */
export const getSpecificUser=async(req,res,next)=>{
    const {id}=req.params
    const user=await User.findById(id)
        .select('-refershTokens');
    if(!user){
        return next(new AppError("User Not Founded ",404))
    }
    res.status(200).json({
        status:"success",
        data:user
    })
}

/**
 * @desc Get My profile in System
 * @route GET /api/user/me
 * @access Protected
 */

export const getMe=async(req,res)=>{
    res.status(200).json({
        status:"success",
        data:req.user
    })
}

export const updateProfile=async(req,res,next)=>{
    const allowfileds=["name","phone"]
    const updates={};
    allowfileds.forEach(filed=>{
        if(req.body[filed]){
            updates[filed]=req.body[filed]
        }
    })
    console.log(updates)
    console.log(req.user.id)
    const newuser =await User.findByIdAndUpdate(req.user.id,updates,{new :true})
    res.status(200).json({
        status:"success",
        data:newuser
    })
}