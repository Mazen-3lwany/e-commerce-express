
import Cart from "../../../DB/models/cart.js"
import AppError from "../../utils/appError.js"

/**
 * 
 * @desc ADD Product To cart
 * @route Post api/cart/
 * @access Private
 */
export const addToCart=async(req,res,next)=>{
    const {productId,quantity}=req.body
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
                    quantity
                }
            ]
        })
        res.status(201).json({
            status:"success",
            data:{cart}
        })
    }
    const itemIndex=cart.items.findIndex(
        (item)=>item.product.toString()===productId
    )
    if(itemIndex>-1){
        cart.items[itemIndex].quantity+=1;
    }else{
        cart.items.push({product:productId,quantity})
    }
    await cart.save()
    res.status(200).json({
        status:"success",
        data:{cart}
    })
}