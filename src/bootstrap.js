import express from "express";
import "./config/env.js"; // Import environment variables 
import dbConnection from "../DB/connection.js";
import categoryRouter from "./modules/Category/category.route.js";
import { globalError } from "./middlewares/error.middleware.js";
import userRoutes from "./modules/User/user.route.js";
import productRoutes from "./modules/Product/product.route.js";
import cartRoutes from "./modules/Cart/cart.route.js";
import wishlistRoutes from "./modules/wishlist/wishlist.route.js";
import orderRoutes from "./modules/order/order.route.js"
import cors from "cors";
const app =express();

app.use(express.json());
dbConnection();
/*
    app.use(): this mean run this function for every request
    express.json(): is a built-in middleware use for parsing Json request 
        to js object 
 */
//routes
app.use("/api/categories",categoryRouter);
app.use("/api/users",userRoutes)
app.use("/api/products",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/wishlist",wishlistRoutes)
app.use("/api/order",orderRoutes)
app.get("/", (req, res) => {
    res.send("Welcome to the Home Page");
});
app.use(cors());
app.use(globalError)
export default app;
