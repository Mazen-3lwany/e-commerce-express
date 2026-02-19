
import mongoose, { disconnect } from "mongoose";
import slugify from "slugify";

const productSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"title is required"],
        minLength:[3,"title must be at least 3 characters"]
    },
    slug:String,
    description:{
        type :String,
        required:[true,"description is required"],
        minLength:[15,"description must be at least 15 characters"]
    },
    price:{
        type:Number,
        required:[true,"price is required"],
        min:[1,"price must be postive number"]
    },
    discountPercentage:{
        type:Number,
        default:0,
        min:[0,"discountPercentage must be positive number"],
        max:[100,"discountPercentage must be less than or equal to 100"]
    },
    priceAfterDiscount:{
        type:Number
    },
    stock:{
        type:Number,
        required:[true,"stock is required"]
    },
    sold:{
        type:Number,
        default:0
    },
    images:[{
        public_id:String,
        url:String
    },], // url come from cloudinary
    status: {
        type: String,
        enum: ["active", "inactive", "archived"],
        default: "active",
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:[true,"category is required"]
    }
},{
    timestamps:true
})
// create index for price after discount and category
productSchema.index({priceAfterDiscount:1}) // index for final Price
productSchema.index({category:1})// index for Category
// componeded index 
productSchema.index({category:1,priceAfterDiscount:1}) //index by price and category
// calculate price after discount
productSchema.pre("save",function(next){
    if(this.discountPercentage){
    this.priceAfterDiscount=this.price-(this.price*this.discountPercentage)/100;
    }
    next
})
productSchema.pre("findOneAndUpdate",function(next){
    const update =this.getUpdate()
    if(update.price||update.discountPercentage){
        const price=update.price??this.get("price")
        const discount=update.discountPercentage??this.get("discountPercentage")
        update.priceAfterDiscount=price-(price*discount)/100
    }
    next
})

// create slug from name
productSchema.pre("save",function(next){
    this.slug=slugify(this.title,{lower:true})
    next
})
productSchema.pre("findOneAndUpdate",function(next){
    const update=this.getUpdate()
    if(update.title){
        update.slug=slugify(update.title,{lower:true})
    }
    next
})

// find not deleted products only
productSchema.pre(/^find/,function(next){
    if (this.getOptions().skipPreFind) return next;
    this.find({ isDeleted:{$ne:true}})
    next
}) 


const Product =mongoose.model("Product",productSchema)
export default Product