import AppError from "../utils/appError.js"

export const validate=(schema,property="body")=>{
    return (req,res,next)=>{
        const {error,value}=schema.validate(req[property],{
            abortEarly:true, // for return all errors
        })
        if(error){
            const message=error.details.map((d)=>d.message).join(",")
            return next(new AppError(message,404))
        }
        req[property]=value
        next()
    }
}