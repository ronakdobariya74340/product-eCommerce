import mongoose, { Schema } from "mongoose";
import moment from "moment";
import { DateInHumanReadleFormat } from "../lib/general.lib.js  ";

const STATUS = {
   INACTIVE: 0,
   ACTIVE: 1,
};

const MEMBERSHIP_TYPE = {
   FOLLOWER: 1,
   FAN: 2,
   VIP: 3,
};

const BILLING_CYCLE = {
   MONTHLY: 1,
   QUARTERLY: 2,
   YEARLY: 3,
};

const membership_Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: true,
        },
        membershipEntries: {
            type: Number,
            required: true,
        },
        membershipFreeEntryPacks: {
            type: Number,
            required: true,
        },
        userPackPurchaseLimit: {
            type: Number,
            required: true,
        },
        userPackEntryLimit: {
            type: Number,
            required: true,
        },
        membershipType: {
            type: Number,
            enum: Object.values(MEMBERSHIP_TYPE),
            default: MEMBERSHIP_TYPE.FOLLOWER,
        },
        status: {
            type: Number,
            enum: Object.values(STATUS),
            default: STATUS.INACTIVE,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

membership_Schema.virtual("readable_created_at").get(function () {
   return DateInHumanReadleFormat(this.created_at);
});

membership_Schema.virtual('formated_created_at').get(function () {
  return moment(this.created_at).format('MMM DD, YYYY');
});

const Membership = mongoose.model("membership", membership_Schema);

export default Membership;
