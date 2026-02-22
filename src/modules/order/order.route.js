import { Router } from "express";
import { getMyOrders, getSpecificOrderAdmin, getSpecificOrderUser, placeOrder, updateOrder } from "./order.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { placeOrderSchema } from "./order.validation.js";
import asyncHandler from "express-async-handler"
import {protect} from "../../middlewares/protect.middleware.js"
import {roleAccess} from "../../middlewares/roleAccess.middleware.js"

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
orderRoutes.get("/"
    ,protect,
    roleAccess("ADMIN"),
    asyncHandler(getMyOrders)
)
orderRoutes.get("/:orderId",
    protect,
    roleAccess("ADMIN"),
    asyncHandler(getSpecificOrderAdmin)
)

orderRoutes.get("/:orderId",
    protect,
    asyncHandler(getSpecificOrderUser)
)
orderRoutes.patch("/:orderId",
    protect,
    asyncHandler(updateOrder)
)
export default orderRoutes