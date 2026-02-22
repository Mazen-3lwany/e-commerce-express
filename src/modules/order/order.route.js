import { Router } from "express";
import { getMyOrders, placeOrder } from "./order.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { placeOrderSchema } from "./order.validation.js";
import asyncHandler from "express-async-handler"
import {protect} from "../../middlewares/protect.middleware.js"

const orderRoutes=Router()

orderRoutes.post(
    "/",
    validate(placeOrderSchema),
    protect,
    asyncHandler(placeOrder)
)
orderRoutes.get("/me"
    ,protect,
    asyncHandler(getMyOrders)
)
export default orderRoutes