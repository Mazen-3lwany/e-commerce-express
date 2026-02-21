
import mongoose from "mongoose";

const wishlistSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    products:
        {
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Product",
        default:[]
        
    }

},{
    timestamps:true
})


const Wishlist=mongoose.model("Wishlist",wishlistSchema)
export default Wishlist