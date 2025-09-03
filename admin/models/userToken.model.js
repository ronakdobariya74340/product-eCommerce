import mongoose, { Schema } from "mongoose";
import { DateInHumanReadleFormat } from "../lib/general.lib.js";

const userTokenSchema = new Schema(
    {
        userid: {
            type: String,
            default: "",
        },
        device: {
            type: String,
            default: "",
        },
        token: {
            type: String,
            default: "",
        },
        ip: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: "",
        },
        userAgent:{
            type: String,
            default:""
        },
        status: {
            type: Number,
            default: 0,
        },
        deviceVendor:{
            type: String,
            default:""
        },
        browser:{
            type: String,
            default:""
        },
        deviceModal:{
            type: String,
            default:""
        },
        os:{
            type: String,
            default:""
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

userTokenSchema.virtual('readable_created_at').get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

const UserToken = mongoose.model("UserToken", userTokenSchema);

export default UserToken;
