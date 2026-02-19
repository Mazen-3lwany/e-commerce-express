import mongoose from "mongoose";
import Product from "../../../DB/models/product";
import Category from "../../../DB/models/category"
import AppError from "../../utils/appError"
import { uploadMultipleImages } from "../../utils/cloudinary.service";
/**
 * @desc Create New Product 
 * @route Post /api/products/create
 * @access Private (only admin)
 */
export const createProduct=async(req,res,next)=>{
    const { title,
            description,
            price,
            discountPercentage,
            stock,
            
            category
    }=req.body;
    const images=await uploadMultipleImages(req.files,"products")
    //check if category exists
    const exsitcategory=await Category.findById(category)
    if(!exsitcategory){
        return next (new AppError("category not found",404))
    }
    // create product
    const product=await Product.create({
        title,
        description,
        price,
        discountPercentage,
        stock,
        images,
        category
    })

    // send response 
    res.status(201).json({
        status:"success",
        message:"Product created successfully",
        data:{product}
    })
    
}