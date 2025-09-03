import mongoose from "mongoose";
import {DateInHumanReadleFormat} from "../lib/general.lib.js"; 

const STATUS = {
    PENDING: 0,
    ACTIVE: 1,
    REDEEMED: 2,
}

const GIFT_SEND_STATUS = {
    PENDING: 0,
    SUCCESS: 1,
}

const giftCardSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productCategoryId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "productCategory",
            required: true
        },
        giftCardUrl: {
            type: String,
            required: true
        },
        giftCardCode:{
            type: String,
            required: true
        },
        fromEmail:{
            type: String,
            default: "",
        },
        toEmail:{
            type: String,
            default: "",
        },
        amount:{
            type: Number,
            default: 0,
        },
        giftSendStatus: {
            type: Number,
            enum: Object.values(GIFT_SEND_STATUS),
            default: GIFT_SEND_STATUS.PENDING,
        },
        status: {
            type: Number,
            enum: Object.values(STATUS),
            default: STATUS.PENDING,
        },
    },{
        timestamps:{
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

giftCardSchema.virtual("created_at_human").get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

const Giftcard = mongoose.model("Giftcard", giftCardSchema);
export default Giftcard;