import mongoose, { Schema } from "mongoose";
import moment from "moment";
import { DateInHumanReadleFormat } from "../lib/general.lib.js  ";

const STATUS = {
   INACTIVE: 1,
   ACTIVE: 2,
};

const productBannerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: Array,
            default: [],
        },
        status: {
            type: Number,
            enum: Object.values(STATUS),
            default: STATUS.ACTIVE,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

productBannerSchema.virtual("readable_created_at").get(function () {
   return DateInHumanReadleFormat(this.created_at);
});

productBannerSchema.virtual('formated_created_at').get(function () {
  return moment(this.created_at).format('MMM DD, YYYY');
});

const ProductBanner = mongoose.model("productBanner", productBannerSchema);

export default ProductBanner;
