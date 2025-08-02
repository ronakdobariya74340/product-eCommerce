import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        cartData: {
            type: Array,
            default: [],
        },
    },
    {
        versionKey: false,
        timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
        },
    },
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
