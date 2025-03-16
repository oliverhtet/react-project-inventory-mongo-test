import mongoose, { Schema, models } from "mongoose"

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
})

const cartSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  },
)

export const Cart = models.Cart || mongoose.model("Cart", cartSchema)

