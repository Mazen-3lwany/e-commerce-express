import jwt from "jsonwebtoken";

export const generateAccessToken=(userId,userRole)=>{
    return jwt.sign({id:userId,role:userRole},process.env.JWT_SECRET,{
        expiresIn:"15m"
    })
}
    export const generateRefreshToken=(userId,userRole)=>{
        if (!userId) throw new Error("User ID is required for refresh token");
        return jwt.sign({id:userId,role:userRole},process.env.JWT_REFRESH_SECRET,{
            expiresIn:"7d"}
        )
    }
