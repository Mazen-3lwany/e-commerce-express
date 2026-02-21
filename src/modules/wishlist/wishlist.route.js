import { Router } from "express";
import { protect } from "../../middlewares/protect.middleware.js";
import asyncHandler from "express-async-handler"
import { addToWishlist, clearWishlist, getMyWishlist, removeFromwishlist } from "./wishlist.controller.js";
const wishlistRoutes=Router();

wishlistRoutes.post("/",
    protect,
    asyncHandler(addToWishlist)
)
wishlistRoutes.delete(
    "/:productId",
    protect,
    asyncHandler(removeFromwishlist)
)
wishlistRoutes.delete("/",
    protect,
    asyncHandler(clearWishlist)
)

wishlistRoutes.get("/",
    protect,
    asyncHandler(getMyWishlist)
)
export default wishlistRoutes