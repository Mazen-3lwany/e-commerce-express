import { Router } from "express";
import {protect} from "../../middlewares/protect.middleware.js"
import { addToCart, clearCart, getMyCart, removeProductFromCart, updateQuantity } from "./cart.controller.js";
import asyncHandler from "express-async-handler";
const cartRoutes=Router()

cartRoutes.post(
    "/",
    protect,
    asyncHandler(addToCart)
)
cartRoutes.delete(
    "/:productId",
    protect,
    asyncHandler(removeProductFromCart)
)
cartRoutes.patch(
    "/:productId",
    protect,
    asyncHandler(updateQuantity)
)
cartRoutes.delete(
    "/",
    protect,
    asyncHandler(clearCart)
)
cartRoutes.get(
    "/",
    protect,
    asyncHandler(getMyCart)
)
export default cartRoutes