import mongoose  from "mongoose";
const categorySchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:[true,"Category must be unique "],
        trim:true
    },
    slug:{
        type:String,
        lowercase:true
    },
    image:String,
    
    isDeleted: {
        type: Boolean,
        default: false
    },
    
},
{timestamps:true}
);
const Category=mongoose.model('Category',categorySchema);
export default Category;