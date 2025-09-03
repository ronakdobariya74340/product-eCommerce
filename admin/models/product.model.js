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

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        productCategoryId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "productCategory",
            required: true
        },
        image: {
            type: Array,
            default: [],
        },
        backgroundImage: {
            type: Array,
            default: [],
        },
        productPrice: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
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

productSchema.virtual('readable_created_at').get(function () {
    return DateInHumanReadleFormat(this.created_at);
});

productSchema.virtual('formated_created_at').get(function () {
  return moment(this.created_at).format('MMM DD, YYYY');
});

const Product = mongoose.model("Product", productSchema);

export default Product;
