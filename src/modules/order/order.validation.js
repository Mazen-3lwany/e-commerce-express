import Joi from "joi";

export const placeOrderSchema=Joi.object({
    paymentMethod: Joi.string()
        .valid("cash", "stripe")
        .required()
        .messages({
            "any.only": "Payment method must be either 'cash' or 'stripe'",
            "any.required": "Payment method is required"
        }),
    shippingAddress: Joi.object({
        street: Joi.string().required().messages({
            "string.empty": "Street is required"
        }),
        city: Joi.string().required().messages({
            "string.empty": "City is required"
        }),
        country: Joi.string().required().messages({
            "string.empty": "Country is required"
        })
    }).required().messages({
        "object.base": "Shipping address is required"
    })
})


export const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "canceled"),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed", "refunded"),
  shippingAddress: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    country: Joi.string()
  })
}).min(1);