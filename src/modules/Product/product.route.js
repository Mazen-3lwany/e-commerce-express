import { Router } from "express";
import asyncHandler from "express-async-handler";
import { validate } from "../../middlewares/validation.middleware.js";
import { createProductSchema, updateProductSchema } from "./product.validation.js";
import upload from "../../middlewares/upload.middleware.js";
import { createProduct, deleteProduct, getAllProducts, getSpecificProduct, restoreProduct, updateProduct } from "./product.controller.js";
import {protect } from "../../middlewares/protect.middleware.js"
import {roleAccess} from "../../middlewares/roleAccess.middleware.js"

const productRoutes=Router();

productRoutes.post(
        "/create",
        protect,
        roleAccess("ADMIN"),
        validate(createProductSchema),
        upload.array("images",5),
        asyncHandler(createProduct)
    )
    productRoutes.get("/",
        asyncHandler(getAllProducts)
    )
    productRoutes.get("/:id",
        asyncHandler(getSpecificProduct)
    )
    productRoutes.put("/:id",
        protect,
        roleAccess("ADMIN"),
        upload.array("images",5),
        validate(updateProductSchema),
        asyncHandler(updateProduct)
    )
    productRoutes.delete("/:id",
        protect,
        roleAccess("ADMIN"),
        asyncHandler(deleteProduct)
    )
    productRoutes.put("/restore/:id",
        protect,
        roleAccess("ADMIN"),
        asyncHandler(restoreProduct)
    )

export default productRoutes;