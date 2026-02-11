import AppError from "../utils/appError.js"
/**
 * @desc function take any number of parameters and return Middleware 
 * to check the user with role are have permissions to do some actions
 */
export const roleAccess=(...allowRoles)=>{ //rest parameter that allow function to accept any number of parameters
    return (req,res,next)=>{
    const {role}=req.user
    if(!role){
        return next(new AppError("Error Role undefiend",500))
    }
    if(!allowRoles.includes(role)){
        return next(new AppError("You do not have permission to perform this action",403))
    }
    next()
}
}