import mongoose, { Schema } from "mongoose";
import moment from "moment";
import { DateInHumanReadleFormat } from "../lib/general.lib.js  ";

const STATUS = {
    PENDING: 1,
    ACTIVE: 2,
    SUSPEND: 3,
};

const CATEGORY_TYPE = {
    ACTOR: 1,
    SINGER: 2,
};

const celebritySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: Array,
            default: [],
        },
        backgroundImage: {
            type: Array,
            default: [],
        },
        celebrityAddress: {
            type: String,
            default: "",
        },
        twitchUrl: {
            type: String,
            default: "",
        },
        youTubeUrl: {
            type: String,
            default: "",
        },
        twitterUrl: {
            type: String,
            default: "",
        },
        endTime: {
            type: Date,
        },
        description: {
            type: String,
            default: "",
        },
        categoryType: {
            type: Number,
            enum: Object.values(CATEGORY_TYPE),
            default: CATEGORY_TYPE.ACTOR,
        },
        status: {
            type: Number,
            enum: Object.values(STATUS),
            default: STATUS.PENDING,
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

celebritySchema.virtual('readable_created_at').get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

celebritySchema.virtual('formated_created_at').get(function () {
  return moment(this.created_at).format('MMM DD, YYYY');
});

const Celebrity = mongoose.model("Celebrity", celebritySchema);

export default Celebrity;
