import Category from "../../../DB/models/category.js";
import slugify from "slugify";
import AppError from "../../utils/appError.js";
/**
 *
 * @desc Create a new category
 * @route POST /api/categories
 * @access Private(only For Admin)
 */
export const createCategory = async (req, res) => {
  const { name } = req.body;
  const newCategory = await Category.create({
    name,
    slug: slugify(name),
  });
  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: newCategory,
  });
};
/**
 *
 * @desc Get all categories
 * @route GET /api/categories
 * @access Public
 */
export const getAllCategories = async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const categories = await Category.find({ isDeleted: false })
    .skip(skip)
    .limit(limit);
  if (categories.length == 0) {
    res.status(200).json({ status: "success", message: "No categories found" });
  }
  res.status(200).json({
    status: "success",
    page,
    results: categories.length,
    data: categories,
  });
};

/**
 * @desc Get a single category by ID
 * @route GET /api/categories/:id
 * @access Public
 */
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(`category not founded ${id}`, 404);
  }
  res.status(200).json({
    status: "success",
    message: "Category founded successfully",
    data: category,
  });
};

/**
 * @desc Update a category by ID
 * @route PUT /api/categories/:id
 * @access Private
 */
export const updateCategoryById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  // const category =await Category.findById(id);
  // if(!category){
  //     res.status(404).json({
  //         status:"fail",
  //         message:`category with id ${id} not found`
  //     })
  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    {
      name,
      slug: slugify(name),
    },
    { new: true },
  );
  //{new:true} to return the updated document
  //findByIdAndUpdate(): takes id and update object and third one for options
  if (!updatedCategory) {
    throw new AppError(`category with id ${id} not found`, 404);
  }
  res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    data: updatedCategory,
  });
};

/**
 * @desc Delete a category by ID
 * @route Del /api/categories/:id/hard
 * @access Private
 */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete({ _id: id });
  if (!category) {
    throw new AppError(`this Category with Id:${id} not found`, 404);
  }
  res.status(204).json({
    status: "success",
    message: `this Category with Id:${id} Deleted successfully`,
  });
};

/**
 * @desc Soft Delete a category by ID
 * @route Del /api/categories/:id
 * @access Private
 */
export const deleteCategoryTemporary = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, {
    isDeleted: true,
  },{new:true});
  if (!category) {
    throw new AppError("Category not Found", 404);
  }
  res.status(200).json({
    status: "success",
    message: `this Category with Id:${id} Deleted successfully`,
    data: category,
  });

};
export const restoreCategory=async(req,res)=>{
  const {id}=req.params;
  const category=await Category.findByIdAndUpdate(id,
    {
      isDeleted:false
    },{
      new:true
    }
  )
  if(!category){
    throw new AppError("Category not Found", 404);
  }
  res.status(200).json({
    status: "success",
    message:`Category with Id :${id} restore Successfully`,
    data: category,
  });
}
