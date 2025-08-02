import mongoose, { Schema } from "mongoose";
import { DateInHumanReadleFormat } from "../lib/general.lib.js";

const ResetPasswordTokenSchema = new Schema(
    {
        otp: {
            type: String,
            default: "",
        },
        userName: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            email: true,
            default: "",
        },
        token : {
            type: String,
            default: "",
        },
        expiryTime: {
            type: String,
            default: "",
        },
        isForgotPassword:{
            type: Boolean,
            default: false
        }
    },
    {
        versionKey: false,
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    },
);

ResetPasswordTokenSchema.virtual('readable_created_at').get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

const ResetPasswordToken = mongoose.model("ResetPasswordToken",ResetPasswordTokenSchema )

export default ResetPasswordToken
