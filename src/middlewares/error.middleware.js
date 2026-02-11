import AppError from "../utils/appError.js";
export const globalError = (err, req, res, next) => {
  let error = err;

  // Mongoose CastError (invalid ObjectId)
  if (error.name === "CastError") {
    error = new AppError("Invalid ID format", 400);
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    error = new AppError(`Duplicate value for field: ${field}`, 409);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  console.error("ERROR:", error);

  if (error.isOperational) {
    return res.status(statusCode).json({
      status,
      message: error.message,
    });
  }

  // Programming / unknown error
  return res.status(500).json({
    status: "error",
    message: "Server Error",
  });
};
