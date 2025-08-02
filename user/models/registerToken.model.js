import mongoose, { Schema } from "mongoose";
import { DateInHumanReadleFormat } from "../lib/general.lib.js";

const registerTokenSchema = new Schema(
    {
        token: {
            type: String,
            default: "",
        },
        otp: {
            type: String,
            default: "",
        },
        userName: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            email: true,
            default: "",
        },
        expiryTime: {
            type: String,
            default: "",
        },
    },
    {
        versionKey: false,
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    },
);

registerTokenSchema.virtual('readable_created_at').get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

const RegisterToken = mongoose.model("RegisterToken", registerTokenSchema);

export default RegisterToken;
