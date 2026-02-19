
import Product from "../../../DB/models/product.js";
import Category from "../../../DB/models/category.js"
import AppError from "../../utils/appError.js"
import { deleteMultipleImages, uploadMultipleImages } from "../../utils/cloudinary.service.js";
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

/**
 * @desc Get All Products 
 * @route Get /api/products/
 * @access Public
 */

export const getAllProducts=async(req,res,next)=>{
    const page=req.query.page||1;
    const limit=req.query.limit||10;
    const skip=(page-1)*limit

    const products=await Product.find().skip(skip).limit(limit)
    if(products.length===0){
        res.status(200).json({
            status:"success",
            message:"Not Added  Products yet"
        })
    }
    res.status(200).json({
        status:"success",
        data:{products}
    })
}
/**
 * @desc Get Product By Id
 * @route GET api/products/:id
 * @access Public
 */

export const getSpecificProduct=async(req,res,next)=>{
    const {id}=req.params;
    const product=await Product.findById(id)
    if(!product){
        return next(new AppError("this Product Not Found",404))
    }
    res.status(200).json({
        status:"success",
        data:{product}
    })
}


/**
 * @desc Upate Product 
 * @route Put api/products/:id
 * @access Private (ADMIN Only)
 */

export const updateProduct=async(req,res,next)=>{
    const {id}=req.params;
    const product =await Product.findById(id)
    if(!product){
        return next (new AppError("this Product Not Found",404))
    }

    //if changes images 
    //1. Delete Old Images from cloudinary
    if(Array.isArray(req.files) && req.files.length > 0){
    await deleteMultipleImages(product.images)
    const images=await uploadMultipleImages(req.files,"products")
    product.images=images;
    }
    // update other fields
    const allowedFields = [
        "title",
        "description",
        "price",
        "discountPercentage",
        "stock",
        "category",
];
allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
        product[field] = req.body[field];
    }
});

await product.save();
    res.status(200).json({
        status:"success",
        message:"Product Updated Successfully",
        data:{product}
    })


}

/**
 * @desc Soft Delete Product 
 * @route  Dlete api/products/:id
 * @access Private (ADMIN Only)
 */
export const deleteProduct=async(req,res,next)=>{
    const {id}=req.params;
    const product =await Product.findById(id)
    if(!product){
        return next(new AppError("this Product Not Found",404))
    }
    product.isDeleted=true;
    product.deletedAt=Date.now();
    await product.save();
    res.status(200).json({
        status:"success",
        message:"Product Deleted Successfully"
    })
}

/**
 * @desc Restore Deleted Product
 * @route Put api/products/restore/:id
 * @access Private (ADMIN Only)
 */

export const restoreProduct=async(req,res,next)=>{
    const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    {
        isDeleted: false,
        deletedAt: null,
        status: "active",
    },
    {   new: true ,
        runValidators: true, 
        skipPreFind: true // لو عامل options لتخطي middleware
    }
    );

    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Product restored successfully",
        data: product,
    });
};
