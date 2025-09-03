import mongoose from "mongoose";
import {DateInHumanReadleFormat} from "../lib/general.lib.js"; 

const STATUS = {
    PENDING: 1,
    SUCCESS: 2,
    FAILED: 3,
};

const PAYMENT_METHOD = {
    STRIPE: 1,
    PAYPAL: 2,
    DEFAULT: 3,
};

const TYPE = {
    FREE: 1,
    PAID: 2,
    GIFT: 3,
};

const ticketSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productCategoryId:{
            type: Array,
            default: [],
        },
        paymentId:{
            type: String,
            default: "",
        },
        totalEntries: {
            type: Number,
            default: 0,
        },
        totalCost:{
            type: Number,
            default: 0,
        },
        description:{
            type: String,
            default: "",
        },
        type: {
            type: Number,
            enum: Object.values(TYPE),
            default: TYPE.FREE,
        },
        paymentMethod: {
            type: Number,
            enum: Object.values(PAYMENT_METHOD),
            default: PAYMENT_METHOD.DEFAULT,
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

ticketSchema.virtual("created_at_human").get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;