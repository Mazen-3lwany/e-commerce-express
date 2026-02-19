import Joi from "joi";

export const createProductSchema=Joi.object({
    title:Joi.string().min(3).required().messages({
        "string.base":"title must be a string",
        "string.empty":"title is required",
        "string.min":"title must be at least 3 characters"
    })
    ,
    description:Joi.string().min(15).required().messages({
        "string.base":"description must be a string",
        "string.empty":"description is required",
        "string.min":"description must be at least 15 characters"
    })
    ,
    price:Joi.number().positive().required().messages({
        "number.base":"price must be a number",
        "number.postive":"price must be a positive number",
        "number.empty":"price is required"
    }),
    discountPercentage:Joi.number().min(0).max(100).required().messages({
        "number.base":"discountPercentage must be a number",
        "number.min":"discountPercentage must be a positive number",
        "number.max":"discountPercentage must be less than or equal to 100"
    }),
    stock:Joi.number().integer().positive().required().messages({
        "number.base":"stock must be a number",
        "number.postive":"stock must be a positive number",
        "number.integer":"stock must be an integer",
    })
})