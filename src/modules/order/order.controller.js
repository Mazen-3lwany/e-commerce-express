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

/**
 * @desc Get All Orders
 * @route Get api/orders/
 * @access Private(Admin)
 */
export const getAllOrders=async(req,res,next)=>{
    const page=req.query.page*1||1;
    const limit=req.query.limit*1||5;
    const skip=(page-1)*limit
    const user=req.user;
    if(!user){
        return next(new AppError("User not logg in",401))
    }
    const orders=await Order.find().populate("products.product").skip(skip).limit(limit)
    if(!orders||orders.length===0){
        return next(new AppError("Orders not Found"))
    }
    const totalOrders=await Order.countDocuments()
    res.status(200).json({
        status:"success",
        page:page,
        limit:limit,
        total_number_orders:totalOrders,
        data:{orders}
    })
}

/**
 * @desc Get Specific Order for Admin
 * @route Get api/orders/:id
 * @access Private(Admin)
 */
export const getSpecificOrderAdmin =async(req,res,next)=>{
    const {orderId}=req.params
    const order=await Order.findById(orderId).populate("products.product")
    if(!order){
        return next(new AppError("order not found",404))
    }
    res.status(200).json({
        status:"success",
        data:{order}
    }
    )
}

/**
 * @desc Get Specific Order for Admin
 * @route Get api/orders/:id
 * @access Private(User)
 */

export const getSpecificOrderUser=async(req,res,next)=>{
    const {orderId}=req.params;
    const user = req.user;
    const orders=await Order.find({user:user.id})
    if(!orders||orders.length===0){
        return next(new AppError("not found orders",404))
    }
    const order = orders.find(order => order._id.toString() === orderId.toString());
    if (!order) {
        return next(new AppError("You do not have permission to view this order", 401));
    }
    res.status(200).json({
        status:"success",
        data:{order}
    })
}

/**
 * @desc Update Specific Order for Admin
 * @route Patch api/orders/:id
 * @access Private(Admin)
 */

export const updateOrder=async(req,res,next)=>{
    const {orderId}=req.params;
    const updates=req.body
    const order = await Order.findByIdAndUpdate(orderId, updates, { new: true, runValidators: true });
    if(!order) return next(new AppError("Order not found", 404));
    res.status(200).json({ status: "success", data: { order } });
}
