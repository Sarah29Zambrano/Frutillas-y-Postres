import mongoose, { Schema } from "mongoose";

const CartsCollections = "carritos";

const CartsSchema = new Schema({
  id: Number,
  products: {
    type: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: "productos",
      },
      quantity: { type: Number }
    }],
    default: []
  }
})

const CartModel = mongoose.model(CartsCollections, CartsSchema)

export default CartModel;