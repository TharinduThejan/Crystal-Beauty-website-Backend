import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "customer",
            required: true,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        img: {
            type: String,
            required: false,
            default: "https://avatar.iran.liara.run/public/33",
        }

    }
);
const User = mongoose.model("User", userSchema);
export default User;