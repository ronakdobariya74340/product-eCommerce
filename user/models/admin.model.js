import mongoose from 'mongoose';

const Admin_Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
},{
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },

})

// virtual for password confirmation
Admin_Schema.virtual("readable_created_at").get(()=>{
    return this.created_at.toLocaleString();
})

const Admin = mongoose.model("Admin", Admin_Schema);
export default Admin;