import express from "express";
import asyncHandler from "express-async-handler"; 
import { changePasssword, forgotPassword, loginUser, logoutUser,verifyEmail, registerUser, resetPassword, deleteMe, deleteUser } from "./auth.controller.js";
import { getAllUsers, getMe, getSpecificUser, updateProfile } from "./user.controller.js";
import { protect } from "../../middlewares/protect.middleware.js";
import { roleAccess } from "../../middlewares/roleAccess.middleware.js";
import { loginLimiter } from "../../middlewares/rateLimiting.middleware.js";

const userRoutes=express.Router()

//routes api/users/
userRoutes.post("/register",asyncHandler(registerUser))
userRoutes.post("/login",loginLimiter,asyncHandler(loginUser))
userRoutes.post('/logout',asyncHandler(logoutUser))
userRoutes.post("/auth/forgot-password",protect,asyncHandler(forgotPassword))
userRoutes.put("/auth/reset-password/:token",asyncHandler(resetPassword))
userRoutes.put("/auth/change-password",protect,asyncHandler(changePasssword))
userRoutes.get("/verify-email/:verifytoken", asyncHandler(verifyEmail));
//api/users
userRoutes.get("/",
    protect,
    // roleAccess("ADMIN"),
    asyncHandler(getAllUsers))
    userRoutes.get("/me",protect,asyncHandler(getMe))
    userRoutes.put("/me",protect,asyncHandler(updateProfile))
    userRoutes.get("/:id",
    protect,
    //roleAccess("ADMIN"),
    asyncHandler(getSpecificUser))
    userRoutes.delete("/me",protect,asyncHandler(deleteMe))
    userRoutes.delete("/:id",protect,roleAccess("ADMIN"),asyncHandler(deleteUser))
    

export default userRoutes
