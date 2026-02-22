
import mongoose from "mongoose";

const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    products:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            },
            priceAtPurchase:{
                type:Number,
                required:true,
                min:[1,"Price should be Postive"]
            },
        }
    ],
    totalPrice:{
        type:Number,
    },
    paymentMethod:{
        type:String,
        enum: ["cash", "stripe"],
        required:true
    },
    shippingAddress:{
        street:String,
        city:String,
        country:String
    },
    status:{
        type:String,
        enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
        default:"pending"
    },
},{
    timestamps:true
})
orderSchema.index({ user:1, status:1, createdAt:-1 });
orderSchema.pre("save",function(next){
    this.totalPrice=this.products.reduce(
        (acc,product)=> acc+product.quantity*product.priceAtPurchase,
        0
    )
    next
})
const Order=mongoose.model("Order",orderSchema)
export default Order