import User from "../../../DB/models/user.js"
import AppError from "../../utils/appError.js"
import crypto from "crypto"
import {sendEmail} from "../../utils/sendEmail.js"
import { loginSchema, registerSchema } from "./user.validation.js"
import {generateAccessToken,generateRefreshToken} from "../../utils/generateTokens.js" 
/**
 * @desc Register user in system
 * @route Post /api/users/register
 * @access Public
 */

export const registerUser=async(req,res,next)=>{
    //validate data comes from request 
    const {error}=registerSchema.validate(req.body)// this line check validation of data that comes from request use JOI schema
    if(error){
        return next(new AppError(error.message,400))
    }
    // destructre data that comes from request 
    const {name,email,password}=req.body
    //2.check exsisting user
    const userExsist=await User.findOne({email})
    if(userExsist){
        return next(new AppError("Email already exsists",409))
    }
    //3. create user
    const user=await User.create({name,email,password})// in this iteration that call middleware (pre save) for hashing password and store it after hashing
    const verificationToken=user.createEmailVerificationToken();//this function return un hashed verification Token
    await user.save({validateBeforeSave:false})
    // create url
    const verifyUrl=`${process.env.CLIENT_URL}/api/users/verify-email/${verificationToken}`
    // Send Email
    await sendEmail({
        email:email,
        subject:"Verify Your Email",
        message: `Click this link to verify your email: ${verifyUrl}`

        })
    //4. generate tokens
    // const accessToken=generateAccessToken(user._id.toString(),user.role.toString())
    // const refreshToken= generateRefreshToken(user._id.toString(),user.role.toString())
    // user.refreshTokens.push({ token: refreshToken });
    // await user.save();
    //5. response
    res.status(201).json({
        status:"success",
        message:"User Register successfully ,Please verify Email",
    })
}
/**
 * @desc Verifications Emails for users in system
 * @route Post /api/users/verify-email
 * @access Public
 */
export const verifyEmail=async(req,res,next)=>{
    const {verifytoken}=req.params;
    const hashedVerifyToken=crypto
    .createHash("sha256")
    .update(verifytoken)
    .digest("hex")
    const user=await User.findOne({
        verificationToken:hashedVerifyToken,
        verificationExpire:{$gt:Date.now()}
    })
    if(!user){
        return next(new AppError("token invalid or expire",400))
    }
    user.isVerified=true
    user.verificationToken=undefined;
    user.verificationExpire=undefined;
    await user.save();
    res.status(200).json({
        status: "success",
        message: "Email verified successfully"
    });
}
/**
 * @desc Resend Email Verifications for users in system
 * @route Post /api/users/resend-verification
 * @access Public
 */
export const resendVerification = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError("User not found", 404));

    if (user.isVerified)
        return next(new AppError("Email already verified", 400));

    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${verificationToken}`;

    await sendEmail({
        email: user.email,
        subject: "Verify your email",
        message: `Click to verify: ${verifyURL}`
    });

    res.status(200).json({
        status: "success",
        message: "Verification email sent"
    });
};


/**
 * @desc Login user in system
 * @route Post /api/users/login
 * @access Public
 */
export const loginUser=async(req,res,next)=>{
    // 1.validate
    const {error}=loginSchema.validate(req.body)
    if(error){
        return next(new AppError(error.message,400))
    }

    //2. destructerind data comes from request 
    const {email,password}=req.body

    //3.find user and remmber to return password
    const user=await User.findOne({email}).select("+password") // we use select (+password) to ovverride in filed selsct:false and return password to use in comparison
    if(!user){
        return next(new AppError("Invalid email or password",401))
    }
    
    //4.compare Password
    const isMatch=await user.comparePassword(password) // return promise  should use await
    
    if(!isMatch){
        return next(new AppError("Invalid email or password",401))
    }
    // check email is verified
    if (!user.isVerified) {
        return next(new AppError("Please verify your email first", 401));
    }

    //5.Tokens
    const accessToken=generateAccessToken(user._id,user.role)
    const refershToken=generateRefreshToken(user._id,user.role)

    user.refreshTokens.push({token:refershToken})
    await user.save();

    //6.response
    res.status(201).json({
        status:"success",
        message:"User Login successfully",
        accessToken,
        refershToken
    })
}



/**
 * @desc Logout user (invalidate refresh token)
 * @route POST /api/users/logout
 * @access Private (optional)
 */
export const logoutUser=async(req,res,next)=>{
    // 1.Destructering refresh token from req body
    const {refreshToken}=req.body;
    // 2. if no refresh token user already logout
    if(!refreshToken){
        return res.status(200).json({
            status:"success",
            message:"Logged out successfully"
        })
    }
    //3.find user by refresh token
    const user=await User.findOne({
        "refreshTokens.token":refreshToken
    })
    if(!user){
        return res.status(200).json({
            status:"success",
            message:"Loggedc out successfully"
        })
    }
    //4. remove refresh token
    user.refreshTokens=user.refreshTokens.filter(
        (tokenObj)=>tokenObj.token!==refreshToken
    )
    //5. save changes in user in database
    await user.save();
    //6. response
    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
    }

/**
 * @desc ForgotPassword
 * @route POST /api/users/auth/forgot-password
 * @access Private (optional)
 */

export const forgotPassword=async(req,res,next)=>{
    const {email}=req.body;
    if(!email){
        return next(new AppError("Email is  required",400))
    }
    const user=await User.findOne({email})
    if(!user){
        return next(new AppError("User Not found",404))
    }
    const restToken=user.createPasswordResetToken();// this function do to things 1.return restToken  2 save hashed restToken in database
    await user.save({ validateBeforeSave: false });
    // send mail to user with resttoken
    const restURL=`${process.env.CLIENT_URL}/api/users/auth/reset-password/${restToken}`
    await sendEmail({
        email:user.email,
        subject:"Password Reset",
        body:`rest your Password ${restURL} `
    })
    res.status(200).json({
    success: true,
    message: "Reset link sent to email",
    restURL // remove this in production
});
}

/**
 * @desc ForgotPassword
 * @route PUT /api/auth/reset-password/:token
 * @access Private (optional)
 */
export const resetPassword=async(req,res,next)=>{
    const {token}=req.params
    if (!token){
        return next(new AppError("token not Founded",400))
    }
    const hashedToken=crypto
    .createHash('sha256')
    .update(token)
    .digest("hex")
    console.log("Hashed token from URL:", hashedToken);
    console.log("Current time:", Date.now());
    const user =await User.findOne({resetPasswordToken:hashedToken,
        resetPasswordExpire:{$gt:Date.now()}
    }
    )
   

    if(!user){
        return next (new AppError("Token  expired",400))
    }
    
    if (req.body.password !== req.body.passwordConfirm)
        return next(new AppError("Passwords do not match", 400));
    user.password=req.body.password
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    res.status(200).json({
        status:"success",
        message:"passwrod reset successfully "
    })
}

/**
 * @desc Change Password
 * @route PUT /api/auth/change-password
 * @access Private (optional)
 */
export const changePasssword=async(req,res,next)=>{
    const {currentPassword,newPassword,passwordConfirm}=req.body
    console.log(currentPassword)
    // fetch user from database
    const user = await User.findById(req.user._id).select('+password');
    // check if old password match password of user in database
    const isMatch=await user.comparePassword(currentPassword)
    console.log(isMatch)
    if(!isMatch){
        return next(new AppError("Incorrect  Password",400))
    }
    
    if(!newPassword===passwordConfirm){
        return next(new AppError("your confirm password and new password not match",400))
    }
    user.password=newPassword;
    user.refreshTokens=[]
    await user.save();
    const accessToken=generateAccessToken(user._id.toString(),user.role.toString())
    const refreshToken=generateRefreshToken(user._id.toString(),user.role.toString())
    user.refreshTokens.push({token:refreshToken})
    await user.save();
    res.status(201).json({
        status:"success",
        message:"Password changed successfully",
        data:{
            accessToken:accessToken,
            refreshToken:refreshToken
        }
    })

}

/**
 * @desc Delete your Account  in system
 * @route DEL /api/users/me
 * @access Private (only for admin)
 */
export const deleteMe = async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        isActive: false
    });

    res.status(204).json({
        status: "success",
        data: null
    });
};

/**
 * @desc Deletw user in system
 * @route DEL /api/users/:id
 * @access Private (only for admin)
 */
export const deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null
  });
};


