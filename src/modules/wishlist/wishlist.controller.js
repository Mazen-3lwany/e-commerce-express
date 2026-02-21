import Wishlist from "../../../DB/models/wishlist.js";
import AppError from "../../utils/appError.js";
import Product from "../../../DB/models/product.js";
import { options } from "joi";



/**
 * @desc Add Product To wishlist
 * @route Post /api/wishlist/
 * @access Private
 */
export const addToWishlist=async(req,res,next)=>{
    const {productId}=req.body
    const user=req.user
    if(!user){
        return next(new AppError("User not log in",401))
    }
    const product=await Product.findById(productId) 
    if(!product){
        return next(new AppError("Product not found",404))
    }
    const wishlist=await Wishlist.findOne({user:user.id})
    if(!wishlist){
        const newwishlist=await Wishlist.create({
            user:user.id,
            products:[
                productId
            ]
        })
        return res.status(201).json({
            status:"success",
            data:{wishlist:newwishlist}
        })
    }
    if (!wishlist.products.some(id => id.toString() === productId.toString())) {
        wishlist.products.push(productId);
    }
    await wishlist.save();
    res.status(200).json({
        status:"success",
        data:{wishlist}
    })
}

/**
 * @desc Remove Product from wishlist
 * @route Delete /api/wishlist/:productId
 * @access Private
 */

export const removeFromwishlist=async(req,res,next)=>{
    const {productId}=req.params;
    const user=req.user
    
    if(!user){
        return next(new AppError("User not log in",401))
    }
    const wishlist=await Wishlist.findOne({user:user.id})
    if(!wishlist||wishlist.products.length===0){
        return next(new AppError("wishlist  already empty. can not remove product.",404))
    }
    if(!wishlist.products.some((id)=>id.toString()===productId.toString())){
        return next(new AppError("Product not found in wishlist",404))
    }
    wishlist.products=wishlist.products.filter((product)=> product.toString()!==productId.toString())
    await wishlist.save()
    res.status(200).json({
        status:"success",
        message:`Product with Id ${productId} hase been removed successfully from wishlist`,
        data:{wishlist}
    })
}


/**
 * @desc Clear All Products from wishlist
 * @route Delete /api/wishlist/
 * @access Private
 */
export const clearWishlist=async(req,res,next)=>{
    const user=req.user
    if(!user){
        return next(new AppError("User not log in",401))
    }
    const wishlist=await Wishlist.findOne({user:user.id})
    if(!wishlist||wishlist.products.length===0){
        return next(new AppError("wishlist is already empty ",400))
    }
    wishlist.products=[]
    await wishlist.save()
    res.status(200).json({
        status:"success",
        message:"wishlist has been cleared successfully",
        data:{wishlist}
    })
}

/**
 * @desc Get my  wishlist
 * @route Get /api/wishlist/
 * @access Private
 */
export const getMyWishlist=async(req,res,next)=>{
    const user=req.user
    const page=req.query.page*1||1;
    const limit=req.query.limit*1||5;
    const skip=(page-1)*limit
    if(!user){
        return next(new AppError("User not log in",401))
    }
    const wishlist=await Wishlist.findOne({user:user.id}).populate(
        {
            path:"products",
            options:{
                skip:skip,
                limit:limit
            }
        })
    
    if(!wishlist){
        return next(new AppError("wishlist not found",404))
    }
    res.status(200).json({
        status:"success",
        page:page,
        data:{wishlist}
    })
}