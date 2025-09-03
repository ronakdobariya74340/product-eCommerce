import mongoose, { Schema } from "mongoose";

const STATUS = {
    PENDING: 1,
    COMPLETE: 2,
};

const tempPaymentDataSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        transactionId: {
            type: String,
            default: "",
        },
        ticketId: {
            type: Array,
            default: [],
        },
        gifcardId: {
            type: Array,
            default: [],
        },
        totalAmount: {
            type: Number,
            default: 0,
        },
        totalEntries: {
            type: Number,
            default: 0,
        },
        payment_link: {
            type: String,
            default: "",
        },
        payment_date: {
            type: Date,
            default: Date.now(),
        },
        status: {
            type: Number,
            enum: Object.values(STATUS),
            default: STATUS.PENDING
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

const TempPaymentData = mongoose.model("TempPaymentData", tempPaymentDataSchema);

export default TempPaymentData;
