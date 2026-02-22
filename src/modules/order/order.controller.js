import Order from "../../../DB/models/order.js";
import AppError from "../../utils/appError.js";
import Product from "../../../DB/models/product.js"
import mongoose from "mongoose";
import Cart from "../../../DB/models/cart.js"

/**
 * @desc Place Order
 * @route Post /api/orders/
 * @access Private
 */

export const placeOrder=async(req,res,next)=>{
    // transaction 
    // const session=await mongoose.startSession()
    // session.startTransaction()
    // try{
    const user=req.user
    const {shippingAddress,paymentMethod}=req.body
    const cart = await Cart.findOne({ user: user.id }).populate("items.product")
        if (!cart || cart.items.length=== 0) {
            throw new AppError("Cart is empty", 400)
        }

    let orderproducts=[]
    // get the price of product that user ordered it
    for(const item of cart.items){
        const product=await Product.findById(item.product._id)
        if(!product){
        throw new AppError("product not found",404)
    }
     //check stok of product
    if(item.quantity>product.stock){
        throw new AppError("the Quatity you need not founded now,please place new order with fewer quatity",400)
    }
    //decrease of stock
    product.stock-=item.quantity
    await product.save()
    // prepare order 
    orderproducts.push({
        product:product._id,
        quantity:item.quantity,
        priceAtPurchase:product.priceAfterDiscount
    })
    }
    const order=await Order.create([{
        user:user.id,
        products:orderproducts,
        paymentMethod:paymentMethod,
        shippingAddress:{
            street:shippingAddress.street,
            city:shippingAddress.city,
            country:shippingAddress.country
        }
    }])
    
    // await session.commitTransaction()
    // session.endSession()
    res.status(201).json({
        status:"success",
        messag:"Order Placed successfully",
        data:{order}
    })
// }catch(err){
//         // await session.abortTransaction()
//         // session.endSession()
//         throw err
// }
}

/**
 * @desc Get my Orders
 * @route Get api/orders/me
 * @access Private
 */
export const getMyOrders=async(req,res,next)=>{
    const page=req.query.page*1||1;
    const limit=req.query.limit*1||5;
    const skip=(page-1)*limit
    const user=req.user
    if(!user){
        return next(new AppError("User not found",404))
    }
    const orders=await Order.find({user:user.id}).populate("products.product")
    .skip(skip).limit(limit)
    if(!orders||orders.length===0){
        return next(new AppError("You do not place orders yet ",404))
    }
    const totalOrders=await Order.countDocuments({user:user.id})
    res.status(200).json({
        status:"success",
        page:page,
        limit:limit,
        totalOrders:totalOrders,
        data:{orders}
    })
}