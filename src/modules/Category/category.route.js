import { Router } from "express";
import {
    createCategory,
    deleteCategory,
    deleteCategoryTemporary,
    getAllCategories,
    getCategoryById,
    restoreCategory,
    updateCategoryById,
} from "./category.controller.js";
import asyncHandler from "express-async-handler";
import { validate } from "../../middlewares/validation.middleware.js";
import { createCategorySchemaValidation } from "./category.validation.js";
import { protect } from "../../middlewares/protect.middleware.js";
import { roleAccess } from "../../middlewares/roleAccess.middleware.js";
const categoryRouter = Router();

categoryRouter.post(
    "/",
    validate(createCategorySchemaValidation),
    protect,
    roleAccess("ADMIN"),
    asyncHandler(createCategory),
);

categoryRouter.get("/", asyncHandler(getAllCategories));
categoryRouter.get("/:id", asyncHandler(getCategoryById));

categoryRouter.put("/:id",
    protect,
    roleAccess("ADMIN"),
    asyncHandler(updateCategoryById));
categoryRouter.delete("/:id/permanent",
    protect,
    roleAccess("ADMIN"),
    asyncHandler(deleteCategory));
categoryRouter.delete("/:id",
    protect,
    roleAccess("ADMIN"),
    asyncHandler(deleteCategoryTemporary));
categoryRouter.put("/:id/restore",
    protect,
    roleAccess("ADMIN"),
    asyncHandler(restoreCategory));
export default categoryRouter;
