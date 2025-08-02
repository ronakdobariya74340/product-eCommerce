import mongoose, { Schema } from "mongoose";
import moment from 'moment';
import { DateInHumanReadleFormat } from "../lib/general.lib.js";

const STATUS = {
    PENDING: 1,
    ACTIVE: 2,
    SUSPEND: 3,
};

const userSchema = new Schema(
    {
        userName: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            email: true,
        },
        password: {
            type: String,
        },
        age:{
            type: Number,
            default: 0,
        },
        profileImage: {
            type: String,
            default: "",
        },
        status: {
            type: Number,
            enum: Object.values(STATUS),
            default: STATUS.PENDING,
        },
        country:{
            type: String,
            default: "",
        },
        address:{
            type: String,
            default: "",
        },
        google2faStatus:{
            type: Number,
            default: 0,
        },
        google2faSecret:{
            type: String,
            default: "",
        },
        membershipId: {
            type: Array,
            default: [],
        },
        loginToken:{
            type:[String],
            default:[],
        },
        suspensionHistory: [
            {
                reason: { type: String, trim: true, required: true },
                date: { type: Date, default: Date.now },
            },
        ],
        packLimit: {
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

userSchema.virtual('readable_created_at').get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

userSchema.virtual('formated_created_at').get(function () {
  return moment(this.created_at).format('MMM DD, YYYY');
});

const User = mongoose.model("User", userSchema)

export default User;