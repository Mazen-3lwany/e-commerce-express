import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema =new mongoose.Schema(
{
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
            "Please provide a valid email address",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false, // Do not return password by default
    },
    phone:{
        type:String,
        minlength: [11, "Phone number should be 11 characters"],
        maxlength: [11, "Phone number should be 11 characters"],
        required: false
    }
    ,
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
    isActive: {
        type: Boolean,
        default: true,
        select:false     // Soft delete / account active status
    },
    passwordChangedAt: Date, // For JWT security
    refreshTokens: [
        {
        token: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
          expires: 30 * 24 * 60 * 60, // auto-remove after 30 days
        },
    },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isVerified: {
        type : Boolean,
        default:false
    }, // use this for email verification

    verificationToken: String,
    verificationExpire: Date
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
userSchema.pre('save',async function(){
    if(!this.isModified('password')) return 
    
    const salt =await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // prevent JWT issues
    
})
userSchema.methods.comparePassword=function (password){
    return bcrypt.compare(password,this.password)
}

import crypto from "crypto"

userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString("hex") //1.generate Random Token 
    this.resetPasswordToken=crypto 
        .createHash("sha256")
        .update(resetToken)
        .digest("hex") //2. encrypt restToken and store encrypted version in database
    this.resetPasswordExpire=Date.now()+15*60*1000 //3. make expire date for token
    return resetToken //4. return resettoken for send to user in email 
}
userSchema.methods.createEmailVerificationToken=function(){
    const emailVerificationToken=crypto.randomBytes(32).toString("hex")
    this.verificationToken=crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex")
    this.verificationExpire=Date.now()+10*60*1000
    return emailVerificationToken
}
userSchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } });
    next;
});

const User=mongoose.model("User",userSchema)
export default User;