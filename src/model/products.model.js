import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ProductsCollections = "productos";

const ProductsSchema = new Schema({
  id: Number,
  title: String,
  description: String,
  code: String,
  price: Number,
  status: Boolean,
  stock: Number,
  category: String,
  thumbnails: {
    type: [String],
    default: []
  },
})

ProductsSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model(ProductsCollections, ProductsSchema)

export default ProductModel;