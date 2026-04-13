import mongoose from 'mongoose';

const dbConnection=async()=>{
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("Database connected successfully");
    }catch (error) {
        console.error("Database connection failed:", error.message);
    }
}
export default dbConnection;
/*
mongoose.connect() is asynchronous function that returns a promise. 

*/