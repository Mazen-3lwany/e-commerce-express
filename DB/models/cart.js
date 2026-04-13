
import mongoose from "mongoose";

const cartSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true
            },
            quantity:{
                type:Number,
                min:[1,"the value should not be less than 1"],
                default:1
            },
            price:{
                type:Number,
                required:true,
                min:[0,"price should be positive number"]
            },
            
        }
    ],
    totalPrice:{
                type:Number,
                default:0,
                min:[0,"totalPrice should be positive number"]
            }
},
{
    timestamps:true
})
// index for user to make sure that one user has only one cart 


// restrict duplication of product in cart
cartSchema.pre("save",function(next){
    let cartProducts=new Set() 
    for(let item of this.items){
        const productId=item.product.toString()
        if(cartProducts.has(productId)){
            const err= new Error(`Duplicate Product ${productId} in cart`)
            return next(err)
        }
        cartProducts.add(productId)
    }
    // calculate Total Price
    this.totalPrice = this.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

  next;
})


const Cart=mongoose.model("Cart",cartSchema)
export default Cart