import mongoose, { Schema } from "mongoose";
import { DateInHumanReadleFormat } from "../lib/general.lib.js";
import moment from "moment";

const STATUS = {
    PENDING: 1,
    SUCCESS: 2,
    FAILED: 3,
};

const PAYMENT_METHOD = {
    COD: 1,
    ONLINE: 2,
    CARD: 3,
};

const transactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        paymentId: {
            type: String,
            default: "",
        },
        tax: {
            type: Number,
            default: 0,
        },
        platFormFee: {
            type: Number,
            default: 0,
        },
        totalQuantity: {
            type: Number,
            default: 0,
        },
        totalTrxAmount: {
            type: Number,
            default: 0,
        },
        payment_method: {
            type: Number,
            enum: Object.values(PAYMENT_METHOD),
            default: PAYMENT_METHOD.ONLINE,
        },
        status: {
            type: Number,
            enum: Object.values(STATUS),
            default: STATUS.PENDING,
        },
        paymentDate: {
            type: Date,
            default: "",
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

transactionSchema.virtual('readable_created_at').get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

transactionSchema.virtual('readable_startDate').get(function () {
    return moment(this.startDate).format("MMM D, YYYY");
});

transactionSchema.virtual('readable_endDate').get(function () {
    return moment(this.endDate).format("MMM D, YYYY");
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
