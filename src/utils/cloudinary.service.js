import cloudinary from "../config/cloudinary.js";

export const uploadMultipleImages = async (files, folder) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 1000, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
            });
        },
      );

      stream.end(file.buffer);
    });
  });

  return Promise.all(uploadPromises);
};

export const deleteMultipleImages = async (images) => {
  const deletePromises = images.map((img) =>
    cloudinary.uploader.destroy(img.public_id),
  );

  return Promise.all(deletePromises);
};
