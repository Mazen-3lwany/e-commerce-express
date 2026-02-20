import { Router } from "express";
import {protect} from "../../middlewares/protect.middleware.js"
import { addToCart } from "./cart.controller.js";
import asyncHandler from "express-async-handler";
const cartRoutes=Router()

cartRoutes.post(
    "/",
    protect,
    asyncHandler(addToCart)
)
export default cartRoutes