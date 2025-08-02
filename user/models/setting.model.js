import mongoose, { Schema } from "mongoose";

const Settings_Schema = new Schema(
    {
        name: {
            type: String,
            default: "",
        },
        value: {
            type: String,
            default: "",
        },
        exclusiveAccessToken: {
            type: String,
            default: "",
        },
        maintenanceMode: { 
            type: Number, 
            default: 0 
        },
    },
    {
        versionKey: false,
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

Settings_Schema.virtual('readable_created_at').get(function () {
    return this.created_at.toLocaleString();
});

const Setting = mongoose.model("Settings", Settings_Schema);

export default Setting;