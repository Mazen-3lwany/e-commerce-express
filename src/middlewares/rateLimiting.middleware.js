import rateLimit from "express-rate-limit";

export const loginLimiter=rateLimit({
    max:5,
    windowMs:5*60*1000, // 5 min
    message:"Too many attemps Try,Later"
}); 