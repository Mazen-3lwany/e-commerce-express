import Joi from "joi";

export const createCategorySchemaValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.base": "Category name must be a string",
            "string.empty": "Category name is required",
            "string.min": "Category name must be at least 3 characters",
            "string.max": "Category name must be at most 50 characters",
            
    }),
});
