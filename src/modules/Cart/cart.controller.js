
import Cart from "../../../DB/models/cart.js"
import AppError from "../../utils/appError.js"

/**
 * 
 * @desc ADD Product To cart
 * @route Post api/cart/
 * @access Private
 */
export const addToCart=async(req,res,next)=>{
    const {productId,quantity,price}=req.body
    const user=req.user
    console.log(user)
    if(!user){
        return next(new AppError("User not Logged in ",404))
    }
    const cart=await Cart.findOne({user:user.id})
    if(!cart){
        await Cart.create({
            user:user.id,
            items:[
                {
                    product:productId,
                    quantity,
                    price
                }
            ]
        })
        await cart.save();
        return res.status(201).json({
            status:"success",
            data:{cart}
        })
    }
    const itemIndex=cart.items.findIndex(
        (item)=>item.product.toString()===productId
    )
    if(itemIndex>-1){
        cart.items[itemIndex].quantity+=quantity;
    }else{
        cart.items.push({product:productId,quantity,price})
    }
    await cart.save()
    res.status(200).json({
        status:"success",
        data:{cart}
    })
}

/**
 * 
 * @desc Remove Product from cart
 * @route Delete api/cart/:productId
 * @access Private
 */

export const removeProductFromCart=async(req,res,next)=>{
    const {productId}=req.params
    const user=req.user
    if(!user){
        return next(new AppError("User not Logged in ",401))
    }
    const cart=await Cart.findOne({user:user.id})
    if(!cart){
        return next(new AppError("Cart Not Found",404))
    }
    const cartIndex=cart.items.findIndex(
        (item)=> item.product.toString()===productId
    )
    if(cartIndex==-1){
        return next(new AppError("Product Not Found in Cart",404))
    }
    cart.items.splice(cartIndex,1)
    await cart.save()// here mongoose middleware work recalculate total price

    res.status(200).json({
        status:"success",
        message:`this product with id ${productId} removed from Cart`,
        data:{cart}
    })
}

/**
 * @desc Update Quantity of Product in cart
 * @route PATCH api/cart/:productId
 * @access Private
 */

export const updateQuantity=async(req,res,next)=>{
    const {productId}=req.params;
    const operation=req.query.operation
    if (!["plus","minus"].includes(operation)) {
        return next(new AppError("Invalid operation, must be 'plus' or 'minus'", 400));
    }
    const user=req.user
    if(!user){
        return next(new AppError("USer not logged in",401))
    }
    const cart=await Cart.findOne({user:user.id}).populate("items.product")
    if(!cart){
        return next(new AppError("Cart Not Founded ",404))
    }
    const productIndex=cart.items.findIndex(
        (item)=> item.product._id.toString()===productId
    )
    if(productIndex===-1){
        return next(new AppError("Product Not Founded",404))
    }
    const item=cart.items[productIndex]
    if (operation === "plus") {
        if (item.quantity >= item.product.stock) {
            return next(new AppError("Product quantity cannot exceed stock", 400));
        }
        item.quantity += 1;
    } else if (operation === "minus") {
        if (item.quantity <= 1) {
            return next(new AppError("Product quantity cannot be less than 1", 400));
        }
        item.quantity -= 1;
    }

    await cart.save()
    res.status(200).json({
        status:"success",
        message:`Product Quantity in Cart update by ${operation} one `,
        data:{cart}
    })
}

/**
 * @desc Clear Product from Cart
 * @route Delete api/cart/
 * @access Private
 */

export const clearCart=async(req,res,next)=>{
    const user=req.user
    if(!user){
        return next(new AppError("User not logged in",401))
    }
    const cart=await Cart.findOne({user:user.id})
    if(!cart){
        return next(new AppError("Cart Not Found ",404))
    }
    if(cart.items.length===0){
        return res.status(200).json({
            status:"success",
            message:"Cart already empty",
            data:{cart}
        })

    }
    cart.items=[]
    await cart.save();
    res.status(200).json({
        status:"success",
        message:"All products in cart have been deleted successfully",
        data:{cart}
    })

}

/**
 * @desc Get  My Cart
 * @route Get api/cart/
 * @access Private
 */
export const getMyCart=async(req,res,next)=>{
    const user=req.user
    if(!user){
        return next(new AppError("User not logged in",401))
    }
    const cart=await Cart.findOne({user:user.id}).populate("items.product")
    if(!cart){
        return next(new AppError("Cart Not Found",404))
    }
    res.status(200).json({
        status:"success",
        data:{cart}
    })
} 